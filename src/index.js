const PteroController = require("./modules/PteroController");
const { PTERODACTYL, INSTANCES, EXTRAS } = require("../config.json");
const cron = require("node-cron");
const parser = require("cron-parser");
const { RemoveDuplicatesFromArray } = require("./utils/ArrayTools");
const moment = require("moment-timezone");

const PTAPI = new PteroController(PTERODACTYL.ADDRESS, PTERODACTYL.API_KEY);

const F_W_CRON = EXTRAS.FORCE_WIPE_CRON;
const F_W_TZ = EXTRAS.FORCE_WIPE_TIMEZONE;

console.log(
  `
  
  The console on start up is not going to make sense. This is because a majority of what is going on is not asynchronous.
  Everything will wipe on time but we have indicators for [I #{INDEX}] for the order in which your instances are listed.
  This will allow you to monitor the wipes by instance.
  
  `
);

async function initInstance({ FORCE_WIPE, SERVERS, WIPES }, _instance) {
  return new Promise(async (res, _) => {
    let isUserDefinedFinished,
      isForceWipeDefinedFinished = false;

    console.log(`Initializing instance #${_instance}...`);
    SERVERS.forEach(async (_s, _sI) => {
      const server = await PTAPI.getServerDetails(_s);

      const { name, identifier } = server.attributes;

      console.log(
        `[I #${_instance}] [${name}] (${
          PTERODACTYL.ADDRESS
        }/server/${identifier}) will now force wipe on ${moment(
          parser.parseExpression(F_W_CRON, { tz: F_W_TZ }).next().toISOString()
        )
          .tz(F_W_TZ)
          .format("MMM DD, YYYY @ hh:mm a z")}`
      );

      const task = cron.schedule(
        F_W_CRON,
        async () => {
          const nowTSK = new Date(
            new Date().toLocaleString("en-US", {
              timeZone: F_W_TZ,
            })
          );

          if (nowTSK.getDate() > 7) return;

          await PTAPI.killServer(_s);

          await PTAPI.safeMapWipe(_s, true);

          for (let i = 0; i < FORCE_WIPE.EXTRA_FILES.length; i++) {
            const file = FORCE_WIPE.EXTRA_FILES[i];
            await PTAPI.deleteServerFiles(_s, file.PATH, file.FILES);
          }

          if (FORCE_WIPE.MAP.ENABLED) {
            if (FORCE_WIPE.MAP.MODE.toLowerCase() === "procedural") {
              const seed = FORCE_WIPE.MAP.PROCEDURAL.RANDOMSEED
                ? Math.floor(Math.random() * (2147483647 - 1 + 1)) + 1
                : FORCE_WIPE.MAP.PROCEDURAL.SEED;

              await PTAPI.modifyVariable(_s, {
                name: "WORLD_SEED",
                value: `${seed}`,
              });

              await PTAPI.modifyVariable(_s, {
                name: "WORLD_SIZE",
                value: `${FORCE_WIPE.MAP.PROCEDURAL.SIZE}`,
              });

              await PTAPI.modifyVariable(_s, { name: "MAP_URL", value: null });
            } else {
              const cleanMapList = RemoveDuplicatesFromArray(
                FORCE_WIPE.MAP.CUSTOM.URL_LIST
              );

              let map;

              if (cleanMapList.length === 0) {
                console.error(
                  `[I #${_instance}] (${PTERODACTYL.ADDRESS}/server/${identifier}) We cannot update your map if you do not have a list of maps to choose from.`
                );

                return setTimeout(async () => {
                  await PTAPI.startServer(_s);

                  console.log(
                    `[I #${_instance}] [${name}] (${
                      PTERODACTYL.ADDRESS
                    }/server/${identifier}) has wiped and will force wipe again on ${moment(
                      parser
                        .parseExpression(F_W_CRON, { tz: F_W_TZ })
                        .next()
                        .toISOString()
                    )
                      .tz(F_W_TZ)
                      .format("MMM DD, YYYY @ hh:mm a z")}`
                  );
                }, 10000);
              }

              if (cleanMapList.length === 1) {
                map = cleanMapList[0];
              } else {
                const currentMap = await PTAPI.getVariable(_s, "MAP_URL");

                const unusedMaps = cleanMapList.filter(
                  (x) => x !== currentMap.attributes.server_value
                );

                map = unusedMaps[Math.floor(Math.random() * unusedMaps.length)];
              }

              await PTAPI.modifyVariable(_s, { name: "MAP_URL", value: map });
              await PTAPI.modifyVariable(_s, {
                name: "WORLD_SEED",
                value: null,
              });
            }
          }

          setTimeout(async () => {
            await PTAPI.startServer(_s);

            console.log(
              `[I #${_instance}] [${name}] (${
                PTERODACTYL.ADDRESS
              }/server/${identifier}) has wiped and will force wipe again on ${moment(
                parser
                  .parseExpression(F_W_CRON, { tz: F_W_TZ })
                  .next()
                  .toISOString()
              )
                .tz(F_W_TZ)
                .format("MMM DD, YYYY @ hh:mm a z")}`
            );
          }, 10000);
        },
        {
          scheduled: true,
          timezone: F_W_TZ,
        }
      );

      task.start();

      task.n;

      if (_sI + 1 === SERVERS.length) {
        isUserDefinedFinished = true;
        if (isUserDefinedFinished && isForceWipeDefinedFinished) res();
      }
    });

    WIPES.forEach((wipe) => {
      SERVERS.forEach(async (_s, _sI) => {
        const server = await PTAPI.getServerDetails(_s);

        const { name, identifier } = server.attributes;

        const timeBetweenLastForce = moment(
          parser.parseExpression(F_W_CRON, { tz: F_W_TZ }).prev().toISOString()
        ).diff(
          moment(
            parser.parseExpression(wipe.CRON, { tz: wipe.TIMEZONE }).prev()
          ),
          "days"
        );

        const timeBetweenNextForce = moment(
          parser.parseExpression(F_W_CRON, { tz: F_W_TZ }).next().toISOString()
        ).diff(
          moment(
            parser.parseExpression(wipe.CRON, { tz: wipe.TIMEZONE }).next()
          ),
          "days"
        );

        if (
          Math.abs(timeBetweenLastForce) <=
          EXTRAS.IGNORE_WIPE_WHEN_DAYS_WITHIN_FORCE
        ) {
          console.log(
            `[I #${_instance}] [${name}] (${
              PTERODACTYL.ADDRESS
            }/server/${identifier}) will not wipe on ${moment(
              parser
                .parseExpression(wipe.CRON, { tz: wipe.TIMEZONE })
                .next()
                .toISOString()
            )
              .tz(wipe.TIMEZONE)
              .format(
                "MMM DD, YYYY @ hh:mm a z"
              )} due to the last Force Wipe being within the last ${
              EXTRAS.IGNORE_WIPE_WHEN_DAYS_WITHIN_FORCE
            } days`
          );
        } else if (
          Math.abs(timeBetweenNextForce) <=
          EXTRAS.IGNORE_WIPE_WHEN_DAYS_WITHIN_FORCE
        ) {
          console.log(
            `[I #${_instance}] [${name}] (${
              PTERODACTYL.ADDRESS
            }/server/${identifier}) will not wipe on ${moment(
              parser
                .parseExpression(wipe.CRON, { tz: wipe.TIMEZONE })
                .next()
                .toISOString()
            )
              .tz(wipe.TIMEZONE)
              .format(
                "MMM DD, YYYY @ hh:mm a z"
              )} due to the last Force Wipe being within the next ${
              EXTRAS.IGNORE_WIPE_WHEN_DAYS_WITHIN_FORCE
            } days`
          );
        } else {
          console.log(
            `[I #${_instance}] [${name}] (${
              PTERODACTYL.ADDRESS
            }/server/${identifier}) will now wipe on ${moment(
              parser
                .parseExpression(wipe.CRON, { tz: wipe.TIMEZONE })
                .next()
                .toISOString()
            )
              .tz(wipe.TIMEZONE)
              .format("MMM DD, YYYY @ hh:mm a z")}`
          );
        }

        const task = cron.schedule(
          wipe.CRON,
          async () => {
            const nowTSK = new Date(
              new Date().toLocaleString("en-US", {
                timeZone: F_W_TZ,
              })
            );

            const timeSinceLastForceTSK = moment(
              parser
                .parseExpression(F_W_CRON, { tz: F_W_TZ })
                .prev()
                .toISOString()
            ).diff(nowTSK, "days");

            const timeTillNextForceTSK = moment(
              parser
                .parseExpression(F_W_CRON, { tz: F_W_TZ })
                .next()
                .toISOString()
            ).diff(nowTSK, "days");

            if (
              Math.abs(timeSinceLastForceTSK) <=
                EXTRAS.IGNORE_WIPE_WHEN_DAYS_WITHIN_FORCE ||
              Math.abs(timeTillNextForceTSK) <=
                EXTRAS.IGNORE_WIPE_WHEN_DAYS_WITHIN_FORCE
            ) {
              return console.log(
                `[I #${_instance}] [${name}] (${
                  PTERODACTYL.ADDRESS
                }/server/${identifier}) has cancelled its wipe as it's within ${
                  EXTRAS.IGNORE_WIPE_WHEN_DAYS_WITHIN_FORCE
                } days of a force wipe, it will now wipe on ${moment(
                  parser
                    .parseExpression(wipe.CRON, { tz: wipe.TIMEZONE })
                    .next()
                    .toISOString()
                )
                  .tz(wipe.TIMEZONE)
                  .format("MMM DD, YYYY @ hh:mm a z")}`
              );
            }

            await PTAPI.killServer(_s);
            await PTAPI.safeMapWipe(_s, wipe.BLUEPRINTS);

            for (let i = 0; i < wipe.EXTRA_FILES.length; i++) {
              const file = wipe.EXTRA_FILES[i];
              await PTAPI.deleteServerFiles(_s, file.PATH, file.FILES);
            }

            if (wipe.MAP.ENABLED) {
              if (wipe.MAP.MODE.toLowerCase() === "procedural") {
                const seed = wipe.MAP.PROCEDURAL.RANDOMSEED
                  ? Math.floor(Math.random() * (2147483647 - 1 + 1)) + 1
                  : wipe.MAP.PROCEDURAL.SEED;

                await PTAPI.modifyVariable(_s, {
                  name: "WORLD_SEED",
                  value: `${seed}`,
                });
                await PTAPI.modifyVariable(_s, {
                  name: "WORLD_SIZE",
                  value: `${wipe.MAP.PROCEDURAL.SIZE}`,
                });
                await PTAPI.modifyVariable(_s, {
                  name: "MAP_URL",
                  value: null,
                });
              } else {
                const cleanMapList = RemoveDuplicatesFromArray(
                  wipe.MAP.CUSTOM.URL_LIST
                );

                let map;

                if (cleanMapList.length === 0) {
                  console.error(
                    `[I #${_instance}] (${PTERODACTYL.ADDRESS}/server/${identifier}) We cannot update your map if you do not have a list of maps to choose from.`
                  );

                  return setTimeout(async () => {
                    await PTAPI.startServer(_s);

                    if (
                      Math.abs(timeTillNextForceTSK) <=
                      EXTRAS.IGNORE_WIPE_WHEN_DAYS_WITHIN_FORCE
                    ) {
                      return console.log(
                        `[I #${_instance}] [${name}] (${
                          PTERODACTYL.ADDRESS
                        }/server/${identifier}) has wiped but it's next wipe is within it's within ${
                          EXTRAS.IGNORE_WIPE_WHEN_DAYS_WITHIN_FORCE
                        } days of a force wipe limit, it so it will not wipe on ${moment(
                          parser
                            .parseExpression(wipe.CRON, { tz: wipe.TIMEZONE })
                            .next()
                            .toISOString()
                        )
                          .tz(wipe.TIMEZONE)
                          .format("MMM DD, YYYY @ hh:mm a z")}`
                      );
                    }

                    console.log(
                      `[I #${_instance}] [${name}] (${
                        PTERODACTYL.ADDRESS
                      }/server/${identifier}) has wiped and will wipe again on ${moment(
                        parser
                          .parseExpression(F_W_CRON, { tz: F_W_TZ })
                          .next()
                          .toISOString()
                      )
                        .tz(F_W_TZ)
                        .format("MMM DD, YYYY @ hh:mm a z")}`
                    );
                  }, 10000);
                }

                if (cleanMapList.length === 1) {
                  map = cleanMapList[0];
                } else {
                  const currentMap = await PTAPI.getVariable(_s, "MAP_URL");

                  const unusedMaps = cleanMapList.filter(
                    (x) => x !== currentMap.attributes.server_value
                  );

                  map =
                    unusedMaps[Math.floor(Math.random() * unusedMaps.length)];
                }

                await PTAPI.modifyVariable(_s, { name: "MAP_URL", value: map });
                await PTAPI.modifyVariable(_s, {
                  name: "WORLD_SEED",
                  value: null,
                });
              }
            }

            setTimeout(async () => {
              await PTAPI.startServer(_s);

              if (
                Math.abs(timeTillNextForceTSK) <=
                EXTRAS.IGNORE_WIPE_WHEN_DAYS_WITHIN_FORCE
              ) {
                return console.log(
                  `[I #${_instance}] [${name}] (${
                    PTERODACTYL.ADDRESS
                  }/server/${identifier}) has wiped but it's next wipe is within it's within ${
                    EXTRAS.IGNORE_WIPE_WHEN_DAYS_WITHIN_FORCE
                  } days of a force wipe limit, it so it will not wipe on ${moment(
                    parser
                      .parseExpression(wipe.CRON, { tz: wipe.TIMEZONE })
                      .next()
                      .toISOString()
                  )
                    .tz(wipe.TIMEZONE)
                    .format("MMM DD, YYYY @ hh:mm a z")}`
                );
              }

              console.log(
                `[I #${_instance}] [${name}] (${
                  PTERODACTYL.ADDRESS
                }/server/${identifier}) has wiped and will wipe again on ${moment(
                  parser
                    .parseExpression(wipe.CRON, { tz: wipe.TIMEZONE })
                    .next()
                    .toISOString()
                )
                  .tz(wipe.TIMEZONE)
                  .format("MMM DD, YYYY @ hh:mm a z")}`
              );
            }, 10000);
          },
          {
            timezone: wipe.TIMEZONE,
          }
        );

        task.start();

        if (_sI + 1 === SERVERS.length) {
          isForceWipeDefinedFinished = true;

          if (isUserDefinedFinished && isForceWipeDefinedFinished) res();
        }
      });
    });
  });
}

INSTANCES.forEach(async (instance, _instance) => {
  _instance++; // Just don't want the number 0 showing up and this is the best fix imo.

  await initInstance(instance, _instance);
});

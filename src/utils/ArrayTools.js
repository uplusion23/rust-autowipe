module.exports = {
  RemoveDuplicatesFromArray(strings = []) {
    const uniqueStrings = [];

    for (const str of strings) {
      if (uniqueStrings.includes(str)) continue;
      uniqueStrings.push(str);
    }

    return uniqueStrings;
  },
};

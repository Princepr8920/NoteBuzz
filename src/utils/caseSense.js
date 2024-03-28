function smallLetters(data, wordsToChange) {
  for (let key in data) {
    if (data[key] && wordsToChange.includes(key)) {
      data[key] = data[key].toLowerCase();
    }
  }
  return data;
}

module.exports = smallLetters;

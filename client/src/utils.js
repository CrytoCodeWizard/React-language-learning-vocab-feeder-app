export function shuffleArray(arr) {
  let newArr = [];

  while (arr.length > 0) {
    const randomIndex = Math.floor(Math.random() * arr.length);
    newArr.push(arr[randomIndex]);
    arr.splice(randomIndex, 1);
  }

  return newArr;
}

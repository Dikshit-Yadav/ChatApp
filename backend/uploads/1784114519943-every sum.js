const arr = [54, 45, 86, 75].every( (el) => el % 2 ==0);
console.log("every",arr);

const array = [55, 45,55,45 ,47 ,86, 75].some( (el) => el % 2 ==0);
console.log("some",array);

const sum = [1, 2, 3, 4, 5].reduce ((res, el) => (res+el) );
console.log ("reduce",sum);
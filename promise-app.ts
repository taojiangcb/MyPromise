import { OneArgFN, MyPromise } from "./src/MyPromise";

//then
// const promise = new MyPromise((resolve: OneArgFN, reject: OneArgFN) => {
//   setTimeout(() => {
//     resolve('step1')
//   })
// })
// .then(data => {
//   console.log(data);
// })

//链式调用
// const promise = new MyPromise((resolve: OneArgFN, reject: OneArgFN) => {
//   setTimeout(() => {
//     resolve('step1')
//   })
// })
// .then(data => {
//   console.log(data);
//   return 'step2';
// })
// .then((data)=> {
//   console.log(data)
// })

//thenable 处理
const promise = new MyPromise((resolve: OneArgFN, reject: OneArgFN) => {
  setTimeout(() => { resolve('step1') })
})
.then(data => {
  console.log(data);
  return 'step2';
})
.then((data)=> {
  console.log(data)
})






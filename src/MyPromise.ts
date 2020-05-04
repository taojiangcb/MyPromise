
export type OneArgFN = (val?: any) => void;
export type PromiseConstructFN = (resolve: OneArgFN, reject: OneArgFN) => void;

type STATE = "pending" | 'fulFailled' | 'reject';

export class MyPromise {

  //promise 当前的状态
  private state: STATE = "pending";
  //promise 当前的值
  private value: any = '';

  private reaon: any;

  //fulFailed的链式调用
  private resolveCallBacks: OneArgFN[] = [];
  //错误回调处理
  private reasonCallBacks: OneArgFN[] = [];

  /**全部成功才算resolve */
  static all(promiseAll: MyPromise[]) {
    return new MyPromise((resolve: OneArgFN, reject: OneArgFN) => {
      let index = 0;
      let dataArray: any[] = [];
      try {
        for (let i = 0; i < promiseAll.length; i++) {
          promiseAll[i].then(data => {
            dataArray[i] = data;
            index++;
            if (index === promiseAll.length) {
              resolve(dataArray);
            }
          })
        }
      }
      catch (e) {
        reject(e);
      }
    })
  }

  /**有一个成功就算成功 */
  static race(promiseArray: MyPromise[]) {
    return new MyPromise((resolve: OneArgFN, reject: OneArgFN) => {
      promiseArray.forEach(promise => {
        promise.then(data => resolve(data), reject);
      })
    })
  }

  static resolve(val:any) {
    return new MyPromise((resovle,reject)=>{
      this.resolve(val);
    })
  }

  static reject(reason:any) {
    return new MyPromise((resovle,reject)=>{
      this.reject(reason);
    })
  }

  //fulFailed
  private resolve = (val: any) => {
    //防止resolve 被多次执行
    if (this.state === 'pending') {
      this.state = "fulFailled";
      this.value = val;
      this.resolveCallBacks.map(fn => fn());
    }
  }

  //reject
  private reject = (real: any) => {
    if (this.state === 'pending') {
      this.state = "reject";
      this.reaon = real;
      this.reasonCallBacks.map(fn => fn());
    }
  }

  private resolveHandler = (promise2: MyPromise, x: any, resolve: OneArgFN, reject: OneArgFN) => {
    //判断循环引用  
    if (promise2 === x) {
      return reject(new TypeError('循环引用 promise'));
    }

    let called: boolean = false;
    if (x !== null && typeof x === 'object' || typeof x === 'function') {
      try {
        const then = x.then;
        if (typeof then === 'function') {
          then.call(x, (y: any) => {
            if (called) return;
            called = true;
            this.resolveHandler(promise2, y, resolve, reject);
          },
            (reason: any) => {
              if (called) return;
              called = true;
              reject(reason);
            })
        }
        else {
          resolve(x);
        }
      }
      catch (e) {
        if (called) return
        called = true;
        reject(e);
      }
    }
    else {
      resolve(x);
    }
  }

  constructor(fn: PromiseConstructFN) {
    try {
      fn(this.resolve, this.reject)
    }
    catch (e) {
      this.reject(e);
    }
  }

  /**
   * 
   * @param onFulFailled 
   * @param onReject 
   */
  then(onFulFailled: OneArgFN = val => val, onReject: OneArgFN = err => { throw err }) {
    // if (this.state === "pending") {
    //   this.fulFailledCallBacks.push(onFulFailled);
    // }

    // //支持链式调用
    // if (this.state === 'pending') {
    //   //1.先返回一个Promise
    //   return new MyPromise((resolve, reject) => {
    //     //2.添加一个待执行函数来处理then的链式调用
    //     this.resolveCallBacks.push(()=>{
    //       //上一次then的处理结构
    //       let x = onFulFailled(this.value);
    //       //第一次之后会把上一次的 resolve 的值吐给下个的 then 方法
    //       resolve(x);
    //     })
    //   })
    // }

    //支持处理thenable 
    const promise2 = new MyPromise((resolve, reject) => {
      if (this.state === 'fulFailled') {
        setTimeout(() => {
          try {
            let x = onFulFailled(this.value);
            this.resolveHandler(promise2, x, resolve, reject);
          }
          catch (e) {
            reject(e);
          }
        })
      }

      else if (this.state === 'reject') {
        setTimeout(() => {
          try {
            let x = onReject(this.reaon);
            this.resolveHandler(promise2, x, resolve, reject);
          }
          catch (e) {
            this.reject(e);
          }
        })
      }
      if (this.state === 'pending') {
        this.resolveCallBacks.push(() => {
          setTimeout(() => {
            try {
              let x = onFulFailled(this.value);
              this.resolveHandler(promise2, x, resolve, reject);
            }
            catch (e) {
              this.reject(e);
            }
          })
        });

        this.reasonCallBacks.push(() => {
          setTimeout(() => {
            try {
              let x = onReject(this.reaon);
              this.resolveHandler(promise2, x, resolve, reject);
            }
            catch (e) {
              this.reject(e);
            }
          })
        })
      }
    })
    return promise2;
  }
}
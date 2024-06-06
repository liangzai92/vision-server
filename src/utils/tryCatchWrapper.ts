export const tryCatchPromise = (promise: any): any => {
  let err: any;
  let res: any;
  return new Promise((resolve) => {
    promise
      .then((response: any) => {
        res = response;
      })
      .catch((error: any) => {
        console.log('error', error);
        err = error;
      })
      .finally(() => {
        resolve([err, res]);
      });
  });
};

export const tryCatchWrapper =
  (fn: any): any =>
  (...args: any): any => {
    return tryCatchPromise(fn(...args));
  };

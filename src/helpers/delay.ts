const delay = (ms: number) =>
  new Promise((resolve, _reject) => {
    setTimeout(() => {
      resolve(true);
    }, ms);
  });

export default delay;

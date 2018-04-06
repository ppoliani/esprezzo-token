

const latestTime = () => web3.eth.getBlock('latest').timestamp;

// Increases testrpc time by the passed duration in seconds
const increaseTime  = duration => {
  const id = Date.now();

  return new Promise((resolve, reject) => {
    web3.currentProvider.sendAsync({
      jsonrpc: '2.0',
      method: 'evm_increaseTime',
      params: [duration],
      id: id,
    }, err1 => {
      if (err1) return reject(err1);

      web3.currentProvider.sendAsync({
        jsonrpc: '2.0',
        method: 'evm_mine',
        id: id + 1,
      }, (err2, res) => {
        return err2 ? reject(err2) : resolve(res);
      });
    });
  });
}

/**
 * Beware that due to the need of calling two separate testrpc methods and rpc calls overhead
 * it's hard to increase time precisely to a target point so design your test to tolerate
 * small fluctuations from time to time.
 *
 * @param target time in seconds
 */
const increaseTimeTo = target => {
  const now = latestTime();
  if (target < now) throw Error(`Cannot increase current time(${now}) to a moment in the past(${target})`);
  let diff = target - now;
  return increaseTime(diff);
}

const delay = ms => new Promise((resolve, reject) => setTimeout(resolve, ms));

const seconds = val => val;
const minutes = val => val * seconds(60);
const hours = val => val * minutes(60);
const days = val => val * hours(24);
const weeks = val => val * days(7);
const months = val => val * days(30);
const years = val => val * days(365);


module.exports = {
  latestTime,
  increaseTimeTo,
  delay,
  duration: {seconds, minutes, hours, days, weeks, months, years}
}


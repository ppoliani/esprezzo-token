  #!/usr/bin/env bash

# Exit script as soon as a command fails.
set -o errexit

# Executes cleanup function at script exit.
trap cleanup EXIT

cleanup() {
  # Kill the testrpc instance that we started (if we started one and if it's still running).
  if [ -n "$testrpc_pid" ] && ps -p $testrpc_pid > /dev/null; then
    kill -9 $testrpc_pid
  fi
}

if [ "$SOLIDITY_COVERAGE" = true ]; then
  testrpc_port=8555
else
  testrpc_port=8545
fi

testrpc_running() {
  nc -z localhost "$testrpc_port"
}

start_testrpc() {
  local mnemonic="manage slow ask bicycle enjoy either swear always ticket child catch phone"

  if [ "$SOLIDITY_COVERAGE" = true ]; then
    node_modules/.bin/testrpc-sc --gasLimit 0xfffffffffff --port "$testrpc_port" --mnemonic "${mnemonic}" --defaultBalanceEther '200000' > /dev/null &
  else
    node_modules/.bin/ganache-cli --gasLimit 0xfffffffffff --gasPrice 10 --mnemonic "${mnemonic}" --defaultBalanceEther '2000'> /dev/null &
  fi

  testrpc_pid=$!
}

if testrpc_running; then
  echo "Using existing testrpc instance"
else
  echo "Starting our own testrpc instance"
  start_testrpc
fi

if [ "$SOLIDITY_COVERAGE" = true ]; then
  node_modules/.bin/solidity-coverage
else
  node_modules/.bin/truffle test "$@"
fi

done

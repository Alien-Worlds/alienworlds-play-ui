export const getFreeActions = () => {
  const freeActions = localStorage.getItem('aw_yeomenTxs')

  return freeActions
}

// export const setFreeActions = async (stats) => {
//   let freeActions

//   if (stats.error === 'LimitTransactionsExceededError') {
//     freeActions = 0
//   } else if (!stats.error && stats.message && stats.message.length > 0) {
//     freeActions = parseInt(
//       stats.message.split('Account has ')[1].split('transactions remaining')[0],
//       10
//     )
//   }

//   localStorage.setItem('aw_yeomenTxs', freeActions)
// }

// export const getYeomenText = () => {
//   let text
//   const localStorageTxs = localStorage.getItem('aw_yeomenTxs')

//   if (!localStorageTxs || localStorageTxs === 'undefined' || localStorageTxs === '0') {
//     text = `No free transactions left`
//   } else {
//     text = `Free Transactions: ${localStorageTxs}`
//   }

//   return text
// }

import gql from 'graphql-tag'

export const EtherInfo =() => {
 let queryString =`{
  bundle (id:"1"){
    ethPriceUSD
  }
}`
  return gql(queryString)
}
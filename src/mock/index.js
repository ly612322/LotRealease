import Mock from 'mockjs'
import lotdata from './data.json'

Mock.setup({
  timeout: 500
})

Mock.mock('../API/LOT RELEASE/LOTRELEASE_LOT发生率.py', 'post', lotdata)

export default Mock

import styles from './page.module.css'
import { getDb, connectToDb } from '../../lib/mongodb'
// import {login,register} from '../../lib/auth'
let db;
connectToDb(
  err => {
    if (err) {
      console.log(err);
    } else {
      console.log("Connected to database");
    }
  }
)
const callLogin = async (data: any) => {
  "use server"
  console.log(data)
}
export default function Home() {
  return (
    <main>
      <form action={callLogin} className='form'>
        <div className='form-row'>
          <label htmlFor='username'>
            Username
          </label>
          <input type='text' name='username' id='username' />
        </div>
        <div className='form-row'>
          <label htmlFor='password'>
            Password
          </label>
          <input type='text' name='password' id='password' />
        </div>
        <div className='form-row'>
          <button className='btn'>Login</button>
        </div>
      </form>
    </main>

  )
}

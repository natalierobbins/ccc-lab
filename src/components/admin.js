import { Title, Authentication } from './ui.js'
import User from '../assets/user.svg'
import Trash from '../assets/trash.svg'
import UserAdd from '../assets/user-add.svg'
import Save from '../assets/save.svg'
import { useEffect, useState } from 'react'
import { getDatabase, ref, push, onValue, set} from "firebase/database";
import { database } from '../firebase.js'
import * as $ from 'jquery'


const AdminEditor = () => {
    return <Authentication body={<Editor />} />
}

const Editor = () => {

    const [ admin, setAdmin ] = useState(null)
    const [ users, setUsers ] = useState(null)
    const [ newAdmin, setNewAdmin ] = useState(null)
    const [ newUsers, setNewUsers ] = useState(null)

    console.log(newAdmin)

    useEffect(() => {

        const getAdmin = async () => {
            const adminRef = ref(database, 'users/admin')
            onValue(adminRef, (snapshot) => {
                try {
                    setAdmin(Object.keys(snapshot.val()).map(key => { return snapshot.val()[key] }))
                }
                catch {
                    setAdmin([])
                }
            })
        }

        const getUser = async () => {
            const userRef = ref(database, 'users/user')
            onValue(userRef, (snapshot) => {
                try {
                    let i = 0
                    setUsers(Object.keys(snapshot.val()).map(key => { return {id: i++, user: snapshot.val()[key]} }))
                } 
                catch {
                    setUsers([])
                }
            })
        }
        let i = 0
        admin ? setNewAdmin(admin.map((item) => { return {id: i++, user: item } })) : getAdmin()
        i = 0
        users ? setNewUsers(users.map((item) => { return {id: i++, user: item } })) : getUser()
    }, [admin, users])

    const set = (idx, e, type) => {
        if (type == 'admin') {
            let temp = [...newAdmin]
            temp[idx].user = e.target.value
            setNewAdmin(temp)
        }
        else {
            let temp = [...newUsers]
            temp[idx].user = e.target.value
            setNewUsers(temp)
        }
    }

    const remove = (idx, type) => {
        console.log(idx)
        if (type == 'admin') {
            let temp = newAdmin.filter(item => item.id != idx)
            let i = 0
            temp.map(item => {
                console.log($(`#admin-${i}`))
                $(`#admin-${i}`).val(item.user)
                $(`#admin-${i}`).text(item.user)
                item.id = i++
            })
            setNewAdmin(temp)
        }
        else {
            let temp = newUsers.filter(item => item.idx != idx)
            let i = 0
            temp.map(item => {
                $(`#user-${i}`).val(item.content)
                item.id = i++
            })
            setNewUsers(temp)
        }
    }

    const add = (type) => {
        if (type == 'admin') {
            var temp = [...newAdmin]
            temp.push({id: temp.length, user: ''})
            setNewAdmin(temp)
        }
        else {
            var temp = [...newUsers]
            temp.push({id: temp.length, user: ''})
            setNewUsers(temp)
        }
    }

    if (newAdmin && newUsers) {
        return (
            <div className='-flex -col -gap -jc-c -al-c'>
                <Title src={User} txt='User editor' />
                <div className='-flex -col form-wrapper'>
                    <div id='admin_wrapper' className='-flex -col -gap'>
                        <h3>Admin users</h3>
                        <p>Admin users are the only ones who can access this page.</p>
                        {newAdmin.map(item => {
                            let isNew = !admin.includes(item.user)
                            return ( 
                                <div className='-flex label-input-wrapper -al-c -jc-sb' key={`${item.id}-${item.user}`}>
                                    {isNew ? <input type='text' onChange={(e) => set(item.id, e, 'admin')} placeholder='Enter email' id={`admin-${item.id}`}></input> : <p id={`admin-${item.id}`}>{item.user}</p>}
                                    <div onClick={() => remove(item.id, 'admin')} className='icon-wrapper -flex -jc-c -al-c'>
                                        <img src={Trash}></img>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                    {!newAdmin.length && <p>No current admin users...</p>}
                    <div id='admin_add' onClick={() => add('admin')} className='add icon-wrapper -full-width -flex -jc-c -al-c'>
                        <img className='icon' src={UserAdd}></img>
                    </div>
                    <br></br>
                    <div id='user_wrapper' className='-flex -col -gap'>
                        <h3>Regular users</h3>
                        <p>Regular users can upload to Firebase</p>
                        {newUsers.map(item => {
                             let isNew = !users.includes(item.user)
                            return ( 
                                <div className='-flex label-input-wrapper -al-c -jc-sb'  key={`${item.id}-${item.user}`}>
                                    {isNew ? <input type='text' placeholder='Enter email' id={`user-${item.id}`}></input> : <p id={`admin-${item.id}`}>{item.user}</p>}
                                    <div className='icon-wrapper -flex -jc-c -al-c'>
                                        <img src={Trash}></img>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                    {!newUsers.length && <p>No current users...</p>}
                    <div id='user_add' onClick={() => add('user')} className='add icon-wrapper -full-width -flex -jc-c -al-c'>
                        <img className='icon' src={UserAdd}></img>
                    </div>
                    <div className='-flex generate -gap -jc-c -al-c' onClick={e => $('#main').submit()}>
                        <img src={Save} className='icon'></img>
                        Save changes
                    </div>
                </div>
            </div>
        )
    }
}

export default AdminEditor
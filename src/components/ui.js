import { setPersistence, inMemoryPersistence, GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import firebase from 'firebase/compat/app';
import * as firebaseui from 'firebaseui'
import 'firebaseui/dist/firebaseui.css'
import { useEffect, useState } from 'react'
import { auth, config, database } from '../firebase.js'
import Logo from  '../assets/ccc-logo-full.png'
import { Link } from 'react-router-dom'
import { get, ref as dbRef, child } from 'firebase/database'

export const Header = () => {
    return (
        <div style={{marginLeft: '50px'}} className='-flex -jc-start -al-c -gap -full-width'>
            <img src={Logo} id='logo' />
            <Link style={{marginLeft: '20px'}} to='/'>Home</Link>
            <Link style={{marginLeft: '20px'}} to='https://sites.google.com/umich.edu/ccc-lab/home'>Lab Website</Link>
        </div>
    )
}

export const Title = (props) => {
    return (
      <div className='-flex jc-start -gap -al-c -jc-c' id='title_segment'>
          <img src={props.src}></img>
          <h1>{props.txt}</h1>
        </div>
    )
}

// var getParticipantCompletion = async (pID, database, stimuli) => {
//     try {
//         var snapshot = await get(child(dbRef(database), `${stimuli.projectid}/${pID}`))
//         console.log('Read successful')
//         return {val: snapshot.val(), stimuli: stimuli}
//     } catch (err) {
//         console.error(err)
//     }

// }

export const Authentication = ({body}) => {
    const [authenticated, setAuthenticated] = useState(localStorage.getItem('authenticated'))

    useEffect(() => {
        const firebaseuiInit = () => {
            firebase.initializeApp(config)
            const ui = firebaseui.auth.AuthUI.getInstance() ||
            new firebaseui.auth.AuthUI(firebase.auth())
            ui.start("#firebaseui-auth-container", {
                signInOptions: [
                    firebase.auth.GoogleAuthProvider.PROVIDER_ID,
                ],
                callbacks: {
                    signInSuccessWithAuthResult: async function(res) {
                        const email = res.additionalUserInfo.profile.email
                        try {
                            var snapshot = await get(child(dbRef(database), 'users/'))
                            if (snapshot.val().includes(email)) {
                                setAuthenticated(true)
                                localStorage.setItem('authenticated', 1)
                            }
                        }
                        catch (err) {
                            console.log(err)
                        }
                        return false;
                    }            
                }
            });
        }

        setPersistence(auth, inMemoryPersistence).then(() => {if (!authenticated) {firebaseuiInit()}})
    }, [])

    return (
        <div className='-flex -jc-c -al-c'>
            {!authenticated && <div style={{width: '500px', maxWidth: '500px'}} id="firebaseui-auth-container"></div>}
            {authenticated && body}
        </div>
    )
}
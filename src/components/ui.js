import { setPersistence, inMemoryPersistence } from 'firebase/auth'
import firebase from 'firebase/compat/app';
import * as firebaseui from 'firebaseui'
import 'firebaseui/dist/firebaseui.css'
import { useEffect, useState } from 'react'
import { auth, config } from '../firebase.js'
import Logo from  '../assets/ccc-logo-full.png'
import { Link } from 'react-router-dom'

export const Header = () => {
    return (
        <div style={{marginLeft: '50px'}} className='-flex -jc-start -al-c -gap -full-width'>
            <Link to='https://sites.google.com/umich.edu/ccc-lab/home'><img src={Logo} id='logo' /></Link>
            <Link style={{marginLeft: '20px'}} to='/'><h4>Home</h4></Link>
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

export const Authentication = ({body}) => {
    const [authenticated, setAuthenticated] = useState(false)

    useEffect(() => {
        const firebaseuiInit = () => {
            firebase.initializeApp(config)
            const ui = firebaseui.auth.AuthUI.getInstance() ||
            new firebaseui.auth.AuthUI(firebase.auth())
            ui.start("#firebaseui-auth-container", {
                signInOptions: [
                    {
                        provider: firebase.auth.EmailAuthProvider.PROVIDER_ID,
                        requireDisplayName: false
                    }
                ],
                callbacks: {
                    signInSuccessWithAuthResult: function() {
                        setAuthenticated(true)
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
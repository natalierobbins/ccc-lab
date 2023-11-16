import { Title } from './ui'
import Search from '../assets/search.svg'
import Lnk from '../assets/link.svg'
import { Link } from 'react-router-dom'

// const NavBody = () => {
//     return (
//         <Authentication body={<Nav />} />
//     )
// }

const NavBody = () => {
    return (
        <div className='-flex -col -gap -jc-c -full-width -al-c'>
            <h1>Welcome!</h1>
            <div className='-flex -col nav-button-wrapper -jc-c -full-width'>
                <NavLink href='/' txt='Create new experiment' />
                <NavLink href='/' txt='Modify existing experiment' />
                <NavLink href='/' txt='Upload stimuli' />
                <NavLink href='https://colab.research.google.com/drive/1Wijl3ebNZ8iMTp14VZrraygqerVKGmxE?usp=sharing' txt='Firebase download' />
            </div>
        </div>
    )
}

const NavLink = (props) => {
    return (
        <Link className='-flex -al-c -gap -full-width' to={props.href}>
            <div className='nav-button'>
                    {props.txt}
            </div>
        </Link>
    )
}

export default NavBody
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
            <Title src={Search} txt="Navigation" />
            <div className='-flex -col label-input-wrapper -jc-c -full-width'>
                <NavLink href='/configuration' txt='Configuration generator' />
                <NavLink href='/upload' txt='Upload config.json' />
                <NavLink href='/combine' txt='CSV Combiner' />
                <NavLink href='https://colab.research.google.com/drive/1Wijl3ebNZ8iMTp14VZrraygqerVKGmxE?usp=sharing' txt='Firebase download' />
            </div>
        </div>
    )
}

const NavLink = (props) => {
    return (
        <Link className='-flex -al-c -gap' to={props.href}>
            <img src={Lnk} className='icon'></img>
            <h4>{props.txt}</h4>
        </Link>
    )
}

export default NavBody
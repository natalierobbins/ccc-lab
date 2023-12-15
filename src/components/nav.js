import { Link } from 'react-router-dom'

export const navigation = [
    {
        'destination': '/create',
        'text': 'Create new experiment',
    },
    {
        'destination': '/modify',
        'text': 'Modify existing experiment',
    },
    {
        'destination': '/upload',
        'text': 'Upload stimuli',
    },
    {
        'destination': '/links',
        'text': 'Generate links'
    }
]

const NavBody = (props) => {
    return (
        <div className='-flex -col -gap -jc-c -full-width -al-c'>
            <h1>{props.title}</h1>
            <div className='-flex -col nav-button-wrapper -jc-c -full-width'>
                {
                    props.links.map((link) => {
                        return ( <NavLink href={link.destination} txt={link.text} key={link.text} />)
                    })
                }
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
import { Link as RouterLink, Outlet } from 'react-router'
import { Link } from '@mui/material'
import logo from './assets/AuditionLogoMedium.png'

export function HeaderLayout() {
  return (<>
    <div className="flex flex-col">
      <div className="flex justify-center">
        <Link component={RouterLink} to="/">
          <img src={logo} alt="AuditionLogo" className='h-24' />
        </Link>
      </div>
    </div>
    <Outlet />
  </>)

}
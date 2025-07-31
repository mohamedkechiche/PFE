import { ImgHTMLAttributes } from 'react';
import logo from './logo.png';

export default function AppLogoIcon(props: ImgHTMLAttributes<HTMLImageElement>) {
    return (
        <img
            {...props}
            src={logo}
            alt="App Logo"
        />
    );
}

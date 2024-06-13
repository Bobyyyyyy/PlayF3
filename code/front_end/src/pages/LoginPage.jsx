import LoginWindow from "../components/login/LoginWindow";
import { BrowserView, MobileView } from 'react-device-detect';
import brandLogo from "../assets/brandNoBg.png"

export default function LoginPage() {
    return (
        <>
            <BrowserView>
                <div className="h-screen w-screen bg-primary flex items-center justify-center">
                    <div className="w-fit h-fit grid grid-cols-5 rounded-xl shadow-xl shadow-gray-900/50">
                        <div className="col-span-3 px-4 py-8 bg-[#a16c41] rounded-l-xl flex flex-col justify-evenly">
                            <h1 className="text-4xl font-bold mx-auto">
                                Really Bad chess
                            </h1>
                            <div className="text-center text-xl text-accent font-semibold">by</div>
                            <img className="w-48 h-48 object-cover  mx-auto"
                                src={brandLogo} alt="PlayF3 logo"></img>
                        </div>
                        <div className="col-span-2 rounded-r-xl">
                            <LoginWindow />
                        </div>
                    </div>
                </div>
            </BrowserView>
            <MobileView>
                <div className="h-screen w-full bg-primary flex flex-col items-center justify-center gap-8">
                    <h1 className="text-6xl font-bold text-center mt-20">Really Bad chess</h1>
                    <div className="h-full mb-14 rounded-lg mx-8">
                        <LoginWindow />
                    </div>
                </div>
            </MobileView>
        </>
    );
}
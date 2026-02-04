"use client";

import Image from "next/image";
import { Constants } from "@/constant";
import { WebComponents } from "..";
import { useRouter } from "next/navigation";

const MaintenancePage = () => {
    const router = useRouter();
    return (
        <div className="bg-[#e6f2ff] flex items-center h-screen">
            <div className="">
                <Image
                    src={Constants.assetsIcon.assets.maintananceVector}
                    alt="Maintenance in progress"
                    height={1000}
                    width={1000}
                />
            </div>
            <div>
                <div>
                    <h2 className="font-poppins font-semibold text-[50px] leading-[60px]">
                        Sorry! We are <br /> Under Maintenance
                    </h2>
                    <p className="font-inter font-normal text-[18px] leading-[26px] tracking-[0.02em] pt-3">
                        The page you're looking for is currently under maintenance <br /> and will be back soon.
                    </p>
                </div>
                <div className="pt-14">
                    <h4 className="font-poppins font-medium text-[22px] leading-8">Get the info after the update is complete</h4>
                    <div className="flex gap-2">
                        <input
                            type="email"
                            placeholder="Enter Your Email"
                            className="px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                        />
                        <button className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors">
                            Submit
                        </button>
                    </div>
                </div>
                <div className="pt-8">
                    <WebComponents.UiComponents.UiWebComponents.Button
                        variant="outline"
                        className="px-5 py-2.5 rounded-lg shadow-sm hover:shadow focus-visible:ring-2 focus-visible:ring-primary/40"
                        onClick={() => router.push('/login')}
                    >
                        {Constants.commonConstants.landingStrings.common.login}
                    </WebComponents.UiComponents.UiWebComponents.Button>
                </div>
            </div>
        </div>
    );
};

export default MaintenancePage;

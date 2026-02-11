import React from 'react';

const SectionHeader = ({ title, description, image }) => {
    return (
        <div className="relative w-full h-[50vh] flex items-center justify-center bg-black">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0">
                <img
                    src={image || "https://assets.nflxext.com/ffe/siteui/vlv3/dace47b4-a5cb-4368-80fe-c26f3e77d540/f5b52435-458f-498f-9d1d-ccd4f1af9913/IN-en-20231023-popsignuptwoweeks-perspective_alpha_website_large.jpg"}
                    alt={`${title} Background`}
                    className="w-full h-full object-cover opacity-30"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-[#141414]"></div>
            </div>

            {/* Content */}
            <div className="relative z-10 text-center px-4 max-w-4xl mx-auto mt-16 animate-slide-up">
                <h1 className="text-4xl md:text-6xl font-bold mb-4 text-white drop-shadow-lg">
                    {title}
                </h1>
                {description && (
                    <p className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto drop-shadow-md font-light">
                        {description}
                    </p>
                )}
            </div>
        </div>
    );
};

export default SectionHeader;

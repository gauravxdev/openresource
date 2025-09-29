const HeroSection = () => {
    return (
        <div className="flex flex-col items-center justify-center mt-30">
            <div className="flex flex-col items-center justify-center text-center max-w-4xl">
                <h1 className="font-lexend text-5xl font-extrabold leading-tight" style={{ fontFamily: 'Lexend, var(--font-lexend), system-ui, sans-serif' }}>
                    Open-source apps & resources
                </h1>
                <h1 className="font-lexend text-5xl font-extrabold leading-tight" style={{ fontFamily: 'Lexend, var(--font-lexend), system-ui, sans-serif' }}>
                    at your fingertips
                </h1>
            </div>
            <div className="flex flex-col items-center justify-center text-center mt-4 max-w-2xl">
                <p className="font-lexend text-lg leading-relaxed" style={{ fontFamily: 'Lexend, var(--font-lexend), system-ui, sans-serif' }}>
                    Discover and explore open-source apps and resources
                </p>
                <p className="font-lexend text-lg leading-relaxed" style={{ fontFamily: 'Lexend, var(--font-lexend), system-ui, sans-serif' }}>
                    tailored for your needs
                </p>
            </div>
        </div>
    )
}

export default HeroSection;
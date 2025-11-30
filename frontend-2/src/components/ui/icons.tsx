import React from 'react';


interface LogoIconProps {
    className?: string;
}


export const GithubLogoIcon: React.FC<LogoIconProps> = ({ className }) => {
    return (
        <img
            className={className}
            alt="Github logo"
            src="https://c.animaapp.com/VxEAZ424/img/github-logo-2-streamline-logos-block---free.svg"
        />
    );
};


export const RedisLogoIcon: React.FC<LogoIconProps> = ({ className }) => {
    return (
        <img
            className={className}
            alt="Redis"
            src="https://c.animaapp.com/VxEAZ424/img/icons8-redis-1.svg"
        />
    );
};


export const GoogleCalendarLogoIcon: React.FC<LogoIconProps> = ({ className }) => {
    return (
        <img
            className={className}
            alt="Google Calendar"
            src="https://c.animaapp.com/VxEAZ424/img/icons8-google-calendar-1.svg"
        />
    );
};


export const ChatGPTLogoIcon: React.FC<LogoIconProps> = ({ className }) => {


    return (
      <img
        className={className}
        alt="ChatGPT/OpenAI logo"
        src="https://upload.wikimedia.org/wikipedia/commons/e/ef/ChatGPT-Logo.svg" // <-- Replace this
      />
    );
};

export const GrafanaLogoIcon: React.FC<LogoIconProps> = ({ className }) => {
    return (
        <img
            className={className}
            alt="Grafana"
            src="https://c.animaapp.com/VxEAZ424/img/icons8-grafana-1.svg"
        />
    );
};


export const ChromaticLogoIcon: React.FC<LogoIconProps> = ({ className }) => {
    return (
        <img
            className={className}
            alt="Chromatic streamline"
            src="https://c.animaapp.com/VxEAZ424/img/chromatic-streamline-simple-icons.svg"
        />
    );
};
import React from 'react';

type ContainerProps = {
    children: React.ReactNode;
    wfull?: boolean;
};

const Container: React.FC<ContainerProps> = ({ children, wfull = false }) => (
    <div className={`mx-auto w-full ${wfull ? "px-6 sm:px-8 lg:px-32" : "max-w-6xl px-4"}`}>
        {children}
    </div>
);

export default Container;
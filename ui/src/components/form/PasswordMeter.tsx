import React from 'react';
import { LinearProgress } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import zxcvbn from 'zxcvbn';

const useStyles = makeStyles({
    root: {
        width: '100%',
        height: 5,
        borderRadius: 5,
        background: 'none',
    },
    bar: ({ color }: { color: string }) => ({
        borderRadius: 5,
        background: color
    })
});

interface PasswordMeterProps {
    password: string;
}

const colors: { [key: number]: string } = {
    20: 'darkred',
    40: 'orangered',
    60: 'orange',
    80: 'yellowgreen',
    100: 'green',
}

const PasswordMeter: React.FC<PasswordMeterProps> = ({ password }: PasswordMeterProps) => {
    const { score, feedback: { warning } } = zxcvbn(password);
    let progress = 0;
    if (password.length > 0) {
        progress = Math.max((score + 1) * 20, 20);
    }
    const classes = useStyles({ color: colors[progress] });

    return (
        <>
            <LinearProgress
                classes={{ root: classes.root, bar: classes.bar }}
                variant="determinate"
                value={progress}
            />
            {warning}
        </>
    );
}

export default PasswordMeter;

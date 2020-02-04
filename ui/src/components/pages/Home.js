import React from 'react';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import { TextField } from '@material-ui/core';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import { makeStyles } from '@material-ui/core/styles';

function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = (Math.random() * 16) | 0,
            v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}

const useStyles = makeStyles(theme => ({
    input: {
        marginTop: 12,
        marginBottom: 24,
    },
}));

export default function Home() {
    const classes = useStyles();

    const [value, setValue] = React.useState('');
    const [items, setItems] = React.useState([]);
    const handleKeyDown = e => {
        if (e.key === 'Enter') {
            setItems([{ id: uuidv4(), text: e.target.value }].concat(items));
            setValue('');
        }
    };
    const handleChange = e => {
        setValue(e.target.value);
    };

    return (
        <Container>
            <Typography variant="h2">Get stuff done!</Typography>
            <TextField
                label="What do you want to do?"
                fullWidth
                inputProps={{ onKeyDown: handleKeyDown }}
                value={value}
                onChange={handleChange}
                className={classes.input}
            />
            {items.map(item => (
                <FormControlLabel
                    key={item.id}
                    control={<Checkbox />}
                    label={item.text}
                    style={{ width: '100%' }}
                />
            ))}
        </Container>
    );
}

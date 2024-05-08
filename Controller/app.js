const mongoose = require('mongoose');
const express = require('express');
const fs = require('fs')
const State = require('./states');
const statesData = JSON.parse(fs.readFileSync('states.json', 'utf8'));

const app = express();
const PORT = process.env.PORT || 3000;

mongoose.connect('mongodb+srv://cooperyoung0987:<Minibeast987$>@states.oxy8tfz.mongodb.net/states', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then (() => {
    console.log('Connected to MongoDB');
    readAndStoreStateData();
})
.catch((error) => {
    console.error('Error connecting to MongoDB:', error);
});

//GET all state data
app.get('/states', async(req, res) =>{
    try {
        const allStates = await State.find({});
        res.json(allStates);
    } catch(err) {
        console.error('Error retrieving state data:', err);
        res.status(500).json({error: 'Internal server error' });
    }
});

//GET state by stateCode

app.get('/states/:state', async(req, res) => {
    try {
        const stateCode = req.params.state.toUpperCase();
        const state = await State.findOne({state: stateCode});
        if(!state) {
            return res.status(404).json({error: 'State not found'});
        }
        res.json(state);
    } catch(err) {
        console.error('Error retrieving state data:', err);
        res.status(500).json({error: 'Internal server error'});
    }
});

//GET random fun fact of state

app.get('/states/:state/funfact', async(req, res) => {
    try {
        const stateCode = req.params.state.toUpperCase();
        const state = await State.findOne({state: stateCode});
        if(!state || !state.funfacts || state.funfacts.length == 0) {
            return res.status(404).json({error: 'No fun facts available for this state'})
        }
        const randomIndex = Math.floor(Math.random() * state.funfacts.length);
        res.json({state: state.state, funfact: state.funfacts[randomIndex]});
    } catch(err) {
        console.error('Error retrieving fun fact:', err);
        res.status(500).json({error: 'Internal server error'});
    }
});

//POST request to add fun facts about a state
app.post('/states/:state/funfact', async(req,res) => {
    try {
        const stateCode = req.params.state.toUpperCase();
        const { funfacts } = req.body;

        const state = await State.findOne({ stateCode });
        if(!state) {
            return res.status(404).json({error: 'State not found'});
        }

        //Merge new fun facts if state already has some
        const updatedFunFacts = state.funfacts ? [...state.funfacts, ...funfacts] : funfacts;

        state.funfacts = updatedFunFacts;
        await state.save();

        res.json(state);
    }catch(err) {
        console.error('Error adding fun facts:', err);
        res.status(500).json({error: 'Internal server error'});
    }
});

//PATCH request to update a specific fun fact of state
app.patch('/states/:state/funfact', async(req, res) => {
    try{
        const stateCode = req.params.state.toUpperCase();
        const {index, funfact} = req.body;

        const state = await State.findOne({stateCode});
        if(!state) {
            return res.status(404).json({error: 'State not found'});
        }

        //update fun fact at specified index
        state.funfacts[index - 1] = funfact;
        await state.save();

        res.json(state);
    }catch(err) {
        console.error('Error updating fun fact:', err);
        res.status(500).json({error:'Internal server error'});
    }
});

//DELETE request to remove a specific fun fact of state
app.delete('/states/:state/funfact', async(req,res) => {
    try{
        const stateCode = req.params.state.toUpperCase();
        const {index} = req.body;

        const state = await State.findOne({stateCode});
        if(!state) {
            return res.status(404).json({error: 'State not found'});
        }

        //Remove fun fact at index
        state.funfacts.splice(index - 1, 1);
        await state.save();

        res.json(state);
    }catch(err) {
        console.error('Error deleting fun fact:', err);
        res.status(500).json({error: 'Internal server error'})
    }
});

//GET capital city of state

app.get('/states/:state/capital', async(req, res) => {
    try {
        const stateCode = req.params.state.toUpperCase();
        const state = await State.findOne({state: stateCode});
        if(!state) {
            return res.status(404).json({error: 'State not found'});
        }
        res.json({state: state.state, capital: state.capital_city});
    } catch(err) {
        console.error('Error retrieving captital city:', err);
        res.status(500).json({error: 'Internal server error'});
    }
});

//GET nickname of state

app.get('/states/:state/nickname', async(req,res) => {
    try {
        const stateCode = req.params.state.toUpperCase();
        const state = await State.findOne({state: stateCode});
        if(!state) {
            return res.status(404).json({error: 'State not found'});
        }
        res.json({state: state.state, nickname: state.nickname});
    } catch(err) {
        console.error('Error retrieving nickname:', err);
        res.status(500).json({error: 'Internal server error'});
    }
});

//GET population of state

app.get('/states/:state/population', async(req, res) => {
    try {
        const stateCode = req.params.state.toUpperCase();
        const state = await State.findOne({state: stateCode});
        if(!state) {
            return res.status(404).json({error: 'State not found'});
        }
        res.json({state: state.state, population: state.population});
    } catch(err) {
        console.error('Error retrieving population', err);
        res.status(500).json({error: 'Internal server error'});
    }
});

//GET admission of state

app.get('/states/:state/admission', async(req, res) => {
    try {
        const stateCode = req.params.state.toUpperCase();
        const state = await State.findOne({state: stateCode});
        if(!state) {
            return res.status(404).json({error: 'State not found'});
        }
        res.json({state: state.state, admitted: state.admission_date });
    }catch(err) {
        console.error('Error retrieving admission date:', err);
        res.status(500).json({error: 'Internal server error'})
    }
});

//GET contiguous states or noncontiguous states

app.get('/states', async(req, res) => {
    const isContiguous = req.query.contig === 'true';
    try {
        if (isContiguous) {
            const contiguousStates = await State.find({stateCode: {$nin: ['AK', 'HI']}});
            res.json(contiguousStates);
        } else {
            const nonContiguousStates = await State.find({stateCode: {$in: ['AK', 'HI']}});
            res.json(nonContiguousStates);
        }
    }catch(err) {
        console.error('Error retrieving states:', err);
        res.status(500).json({error: 'Internal server error'});
    }
});

//Catch for 404 errors

app.use((req,res) => {
    res.status(404).send('404 Not Found');
});

//Reading and storing States.json
function readAndStoreStateData() {
    fs.readFile('states.json', 'utf8', (err, data) => {
        if(err) {
            console.error('Error reading states.json:', err);
            return;
        }

        const statesData = JSON.parse(data);
        const states = statesData.states;
''
        State.insertMany(states)
        .then(() => {
            console.log('State data stored in MongoDB');
        })
        .catch((error) => {
            console.error('Error storing state data in MongoDB:', error);
        });
    });
}

app.listen(PORT, () => {
    console.log('Server is running on port ${PORT}');
});

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5000;


app.use(cors());
app.use(express.json()); 


const mongoURI = 'mongodb://localhost:27017/shiptrack'; 
mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));


const trackDataSchema = new mongoose.Schema({
    trackingNumber: String,
    status: String,
    updated_at: Date,
    current_location: String,
    expected_delivery: Date,
    current_latitude: Number,
    current_longitude: Number,
});

const TrackData = mongoose.model('trackdata', trackDataSchema);


app.post('/track', async (req, res) => {
    const { trackingNumber } = req.body;

    try {
        const shipment = await TrackData.findOne({ trackingNumber });

        if (shipment) {
            return res.json({
                status: 'success',
                data: shipment
            });
        } else {
            return res.status(404).json({ status: 'error', message: 'Invalid Tracking Number' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: 'error', message: 'An error occurred while fetching shipment data.' });
    }
});


app.get('/shipment-history/:trackingNumber', async (req, res) => {
    const { trackingNumber } = req.params;

    try {
        const shipmentHistory = await TrackData.find({ trackingNumber }); 
        if (shipmentHistory.length > 0) {
            return res.json({ status: 'success', data: shipmentHistory });
        } else {
            return res.status(404).json({ status: 'error', message: 'No shipment history found' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: 'error', message: 'An error occurred while fetching shipment history.' });
    }
});


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

const express = require('express');
const sql = require('mssql');
const { body, validationResult } = require('express-validator');
const validator = require('validator');
const router = express.Router();
const axios = require('axios'); // Add axios for making HTTP requests
require('dotenv').config();
const dbConfig = require('../config/db');

// POST route for fast sell form submission
router.post('/fastSell',  async (req, res) => {
    const formData = req.body;
    const referrer = req.get('Referer');

    // Validate the incoming data
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        // Sanitize input data
        const sanitizedFormData = {
            FullName: validator.escape(formData.FullName || ''),
            PropertyAddress: validator.escape(formData.PropertyAddress || ''),
            City: validator.escape(formData.City || ''),
            State: validator.escape(formData.State || ''),
            ZipCode: validator.escape(formData.ZipCode || ''),
            PropertyType: validator.escape(formData.PropertyType || ''),
            Bedrooms: validator.isInt(formData.Bedrooms || '') ? formData.Bedrooms : null,
            Bathrooms: validator.isInt(formData.Bathrooms || '') ? formData.Bathrooms : null,
            SquareFootage: validator.isInt(formData.SquareFootage || '') ? formData.SquareFootage : null,
            LotSize: validator.escape(formData.LotSize || ''),
            YearBuilt: validator.isInt(formData.YearBuilt || '') ? formData.YearBuilt : null,
            PropertyCondition: validator.escape(formData.PropertyCondition || ''),
            AskingPrice: validator.isFloat(formData.AskingPrice || '') ? formData.AskingPrice : null,
            ReasonForSelling: validator.escape(formData.ReasonForSelling || ''),
            Timeframe: validator.escape(formData.Timeframe || ''),
            ContactPhone: validator.escape(formData.ContactPhone || ''),
            ContactEmail: validator.normalizeEmail(formData.ContactEmail || ''),
            AdditionalComments: Array.isArray(formData.AdditionalComments)
            ? validator.escape(formData.AdditionalComments.join(', '))
            : validator.escape(formData.AdditionalComments || ''),
            SubmitDate: new Date().toISOString(),
        };

        // Connect to MSSQL
        const pool = await sql.connect(dbConfig);

        // Insert Data into FastSellForm_tbl
        const query = `
            INSERT INTO dbo.fastsell_tbl (
                FullName, PropertyAddress, City, State, ZipCode, PropertyType,
                Bedrooms, Bathrooms, SquareFootage, LotSize, YearBuilt,
                PropertyCondition, AskingPrice, ReasonForSelling, Timeframe,
                ContactPhone, ContactEmail, AdditionalComments, SubmitDate
            ) VALUES (
                @FullName, @PropertyAddress, @City, @State, @ZipCode, @PropertyType,
                @Bedrooms, @Bathrooms, @SquareFootage, @LotSize, @YearBuilt,
                @PropertyCondition, @AskingPrice, @ReasonForSelling, @Timeframe,
                @ContactPhone, @ContactEmail, @AdditionalComments, @SubmitDate
            )
        `;

        const result = await pool.request()
            .input('FullName', sql.NVarChar, sanitizedFormData.FullName)
            .input('PropertyAddress', sql.NVarChar, sanitizedFormData.PropertyAddress)
            .input('City', sql.NVarChar, sanitizedFormData.City)
            .input('State', sql.NVarChar, sanitizedFormData.State)
            .input('ZipCode', sql.NVarChar, sanitizedFormData.ZipCode)
            .input('PropertyType', sql.NVarChar, sanitizedFormData.PropertyType)
            .input('Bedrooms', sql.Int, sanitizedFormData.Bedrooms)
            .input('Bathrooms', sql.Int, sanitizedFormData.Bathrooms)
            .input('SquareFootage', sql.Int, sanitizedFormData.SquareFootage)
            .input('LotSize', sql.NVarChar, sanitizedFormData.LotSize)
            .input('YearBuilt', sql.Int, sanitizedFormData.YearBuilt)
            .input('PropertyCondition', sql.NVarChar, sanitizedFormData.PropertyCondition)
            .input('AskingPrice', sql.Float, sanitizedFormData.AskingPrice)
            .input('ReasonForSelling', sql.NVarChar, sanitizedFormData.ReasonForSelling)
            .input('Timeframe', sql.NVarChar, sanitizedFormData.Timeframe)
            .input('ContactPhone', sql.NVarChar, sanitizedFormData.ContactPhone)
            .input('ContactEmail', sql.NVarChar, sanitizedFormData.ContactEmail)
            .input('AdditionalComments', sql.NVarChar, sanitizedFormData.AdditionalComments)
            .input('SubmitDate', sql.DateTime, sanitizedFormData.SubmitDate)
            .query(query);

        const { sendEmail, sendEmailWithTemplate } = require('../models/mailer');

        const sendEmails = async () => {
            // Send email to admin
            try {
                const adminRecipients = [{ email: process.env.RECIPIENT_EMAIL1, name: 'Admin' }];
                const adminSubject = 'New Fast Sell Form Submission';
                const adminHtml = `
                    <strong>New submission received from ${sanitizedFormData.FullName}:</strong><br>
                    <p>${JSON.stringify(sanitizedFormData, null, 2)}</p>`;
                const adminText = `New submission from ${sanitizedFormData.FullName}`;

                await sendEmail(adminRecipients, adminSubject, adminText, adminHtml);
                console.log('Admin email sent successfully.');
            } catch (error) {
                console.error('Failed to send admin email:', error.message);
            }

            // Send thank-you email to client
            try {
                const clientRecipient = { email: sanitizedFormData.ContactEmail, name: sanitizedFormData.FullName };
                const clientTemplateId = 'your-template-id'; // Replace with your actual template ID
                const clientTemplateData = {
                    name: sanitizedFormData.FullName,
                    message: 'Thank you for submitting the Fast Sell Form. Our team will get back to you shortly!',
                };

                await sendEmailWithTemplate([clientRecipient], clientTemplateId, clientTemplateData);
                console.log('Client email sent successfully.');
            } catch (error) {
                console.error('Failed to send client email:', error.message);
            }
        };

        sendEmails();

        const successMessage = encodeURIComponent("Form submitted successfully!");
        res.redirect(`${referrer}?success=${successMessage}`);
    } catch (err) {
        console.error(err);
        const errorMessage = encodeURIComponent("Error saving data to database");
        res.redirect(`${referrer}?error=${errorMessage}`);
    } finally {
        sql.close();
    }
});


router.get('/autocomplete', async (req, res) => {
    const query = req.query.query.trim(); // Trim whitespace
    const queryBytes = Buffer.byteLength(query, 'utf8'); // Measure byte size

    if (!query || queryBytes < 7 || queryBytes > 127) {
        return res.status(400).json({ error: 'Query must be between 1 and 127 bytes.' });
    }

    try {
        const response = await axios.get('https://us-autocomplete-pro.api.smarty.com/lookup', {
            params: {
                'auth-id': process.env.authID, // Replace with your actual auth-id
                'search': query, // Use the input query
                'auth-token': process.env.authToken // Replace with your actual auth-token
            },
        });

        // Check if 'suggestions' exists and is an array
        if (Array.isArray(response.data.suggestions)) {
            const suggestions = response.data.suggestions.map(item => ({
                display_name: `${item.street_line}, ${item.city}, ${item.state} ${item.zipcode}`
            }));
            return res.json(suggestions);
        } else {
            // If 'suggestions' is not an array, return an error
            return res.status(500).json({ error: 'Unexpected API response structure.' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch suggestions' });
    }
});

module.exports = router;

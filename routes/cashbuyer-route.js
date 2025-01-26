const express = require('express');
const sql = require('mssql');
const { body, validationResult } = require('express-validator');
const validator = require('validator');
const validateAndSanitize = require('../middleware/validateAndSanitize');
const router = express.Router();
require('dotenv').config();
const dbConfig = require('../config/db');


// POST route for form submission
router.post('/cbForm', validateAndSanitize, async (req, res) => {
    const formData = req.body;
    const referrer = req.get('Referer');
    const userIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    // Validate the incoming data
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        // Sanitize input data to prevent SQL injection or other malicious inputs
        const sanitizedFormData = {
            FullName: validator.escape(formData.FullName || ''),
            CompanyName: validator.escape(formData.CompanyName || ''),
            Website: validator.isURL(formData.Website || '') ? formData.Website : '',
            CellPhone: validator.escape(formData.CellPhone || ''),
            Email: validator.normalizeEmail(formData.Email || ''),
            Address: validator.escape(formData.Address || ''),
            YearsInBusiness: validator.isInt(formData.YearsInBusiness || '') ? formData.YearsInBusiness : null,
            CompletedProjects: validator.isInt(formData.CompletedProjects || '') ? formData.CompletedProjects : null,
            CurrentProjects: validator.escape(formData.CurrentProjects || ''),
            PropertiesNext6Months: validator.isInt(formData.PropertiesNext6Months || '') ? formData.PropertiesNext6Months : null,
            PropertiesPerYear: validator.isInt(formData.PropertiesPerYear || '') ? formData.PropertiesPerYear : null,
            SourceFinancing: Array.isArray(formData.SourceFinancing) ? formData.SourceFinancing.join(', ') : validator.escape(formData.SourceFinancing || ''),
            FundingInPlace: validator.escape(formData.FundingInPlace || ''),
            ProofOfFunds: validator.escape(formData.ProofOfFunds || ''),
            ProofOfFundsFile: 'public/uploaded/' + validator.escape(formData.ProofOfFundsFile || ''),
            TripleDeals: validator.escape(formData.TripleDeals || ''),
            Quickly: validator.escape(formData.Quickly || ''),
            PriceRanges: validator.escape(formData.PriceRanges || ''),
            MinimumProfit: validator.escape(formData.MinimumProfit || ''),
            GoodDealCriteria: validator.escape(formData.GoodDealCriteria || ''),
            PreferredAreas: validator.escape(formData.PreferredAreas || ''),
            AvoidedAreas: validator.escape(formData.AvoidedAreas || ''),
            PropertyType: Array.isArray(formData.PropertyType) ? formData.PropertyType.join(', ') : validator.escape(formData.PropertyType || ''),
            WorkType: Array.isArray(formData.WorkType) ? formData.WorkType.join(', ') : validator.escape(formData.WorkType || ''),
            MaxPropertyAge: validator.isInt(formData.MaxPropertyAge || '') ? formData.MaxPropertyAge : null,
            Mins: validator.escape(formData.Mins || ''),
            IdealProperty: validator.escape(formData.IdealProperty || ''),
            InvestmentStrategy: validator.escape(formData.InvestmentStrategy || ''),
            PurchaseReadiness: validator.isInt(formData.PurchaseReadiness || '') ? formData.PurchaseReadiness : null,
            AdditionalComments: validator.escape(formData.AdditionalComments || ''),
            SubmitDate: new Date().toISOString(),
            CashBuyerIP: userIP
        };

        // Connect to MSSQL
        const pool = await sql.connect(dbConfig);

        // Insert Data into CashBuyerForm_tbl
        const query = `
            INSERT INTO dbo.cashbuyers_tbl (
                FullName, CompanyName, Website, CellPhone, Email, Address, YearsInBusiness,
                CompletedProjects, CurrentProjects, PropertiesNext6Months, PropertiesPerYear, SourceFinancing, FundingInPlace,
                ProofOfFunds, ProofOfFundsFile, TripleDeals, Quickly, PriceRanges, MinimumProfit, GoodDealCriteria,
                PreferredAreas, AvoidedAreas, PropertyType, WorkType, MaxPropertyAge, Mins, IdealProperty,
                InvestmentStrategy, PurchaseReadiness, AdditionalComments, SubmitDate, CashBuyerIP
            ) VALUES (
                @FullName, @CompanyName, @Website, @CellPhone, @Email, @Address, @YearsInBusiness,
                @CompletedProjects, @CurrentProjects, @PropertiesNext6Months, @PropertiesPerYear, @SourceFinancing, @FundingInPlace,
                @ProofOfFunds, @ProofOfFundsFile, @TripleDeals, @Quickly, @PriceRanges, @MinimumProfit, @GoodDealCriteria,
                @PreferredAreas, @AvoidedAreas, @PropertyType, @WorkType, @MaxPropertyAge, @Mins, @IdealProperty,
                @InvestmentStrategy, @PurchaseReadiness, @AdditionalComments, @SubmitDate, @CashBuyerIP
            )
        `;

        const result = await pool.request()
            .input('FullName', sql.NVarChar, sanitizedFormData.FullName)
            .input('CompanyName', sql.NVarChar, sanitizedFormData.CompanyName)
            .input('Website', sql.NVarChar, sanitizedFormData.Website)
            .input('CellPhone', sql.NVarChar, sanitizedFormData.CellPhone)
            .input('Email', sql.NVarChar, sanitizedFormData.Email)
            .input('Address', sql.NVarChar, sanitizedFormData.Address)
            .input('YearsInBusiness', sql.Int, sanitizedFormData.YearsInBusiness)
            .input('CompletedProjects', sql.Int, sanitizedFormData.CompletedProjects)
            .input('CurrentProjects', sql.NVarChar, sanitizedFormData.CurrentProjects)
            .input('PropertiesNext6Months', sql.Int, sanitizedFormData.PropertiesNext6Months)
            .input('PropertiesPerYear', sql.Int, sanitizedFormData.PropertiesPerYear)
            .input('SourceFinancing', sql.NVarChar, sanitizedFormData.SourceFinancing)
            .input('FundingInPlace', sql.NVarChar, sanitizedFormData.FundingInPlace)
            .input('ProofOfFunds', sql.NVarChar, sanitizedFormData.ProofOfFunds)
            .input('ProofOfFundsFile', sql.NVarChar, sanitizedFormData.ProofOfFundsFile)
            .input('TripleDeals', sql.NVarChar, sanitizedFormData.TripleDeals)
            .input('Quickly', sql.NVarChar, sanitizedFormData.Quickly)
            .input('PriceRanges', sql.NVarChar, sanitizedFormData.PriceRanges)
            .input('MinimumProfit', sql.NVarChar, sanitizedFormData.MinimumProfit)
            .input('GoodDealCriteria', sql.NVarChar, sanitizedFormData.GoodDealCriteria)
            .input('PreferredAreas', sql.NVarChar, sanitizedFormData.PreferredAreas)
            .input('AvoidedAreas', sql.NVarChar, sanitizedFormData.AvoidedAreas)
            .input('PropertyType', sql.NVarChar, sanitizedFormData.PropertyType)
            .input('WorkType', sql.NVarChar, sanitizedFormData.WorkType)
            .input('MaxPropertyAge', sql.Int, sanitizedFormData.MaxPropertyAge)
            .input('Mins', sql.NVarChar, sanitizedFormData.Mins)
            .input('IdealProperty', sql.NVarChar, sanitizedFormData.IdealProperty)
            .input('InvestmentStrategy', sql.NVarChar, sanitizedFormData.InvestmentStrategy)
            .input('PurchaseReadiness', sql.Int, sanitizedFormData.PurchaseReadiness)
            .input('AdditionalComments', sql.NVarChar, sanitizedFormData.AdditionalComments)
            .input('SubmitDate', sql.DateTime, sanitizedFormData.SubmitDate)
            .input('CashBuyerIP', sql.NVarChar, sanitizedData.CashBuyerIP)
            .query(query);


        const { sendEmail, sendEmailWithTemplate } = require('../models/mailer');


        console.log('Incoming req.body:', req.body);
        console.log('Sanitized Form Data:', sanitizedFormData);
        console.log('Admin Email:', process.env.RECIPIENT_EMAIL1);
        console.log('Client Email:', sanitizedFormData.Email);


        const sendEmails = async () => {
            console.log('Client Email:', sanitizedFormData);


            // Send email to admin
            try {
                const adminRecipients = [{ email: process.env.RECIPIENT_EMAIL1, name: 'Admin' }];
                const adminSubject = 'New Cash Buyer Form Submission';
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
                const clientRecipient = { email: sanitizedFormData.Email, name: sanitizedFormData.FullName };
                const clientTemplateId = 'your-template-id'; // Replace with your actual template ID
                const clientTemplateData = {
                    name: sanitizedFormData.FullName,
                    message: 'Thank you for submitting the Cash Buyer Form. Our team will get back to you shortly!',
                };

                await sendEmailWithTemplate([clientRecipient], clientTemplateId, clientTemplateData);
                console.log('Client email sent successfully.');
            } catch (error) {
                console.error('Failed to send client email:', error.message);
            }

        };

        sendEmails();

        const successMessage = encodeURIComponent("Form submitted successfully!");
        res.redirect(`${referrer}?success=true&message=${successMessage}`);
    } catch (err) {
        console.error(err);
        const errorMessage = encodeURIComponent("Error saving data to database");
        res.redirect(`${referrer}?error=${errorMessage}`);
    } finally {
        sql.close();
    }
});

module.exports = router;

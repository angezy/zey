const express = require('express');
const sql = require('mssql');
const { body, validationResult } = require('express-validator');
const validator = require('validator');
const router = express.Router();
require('dotenv').config();
const dbConfig = require('../config/db');

// POST route for /kanban
router.post(
    '/kanban',
    [
      // Existing validations
      body('facebookName').isString().withMessage('FacebookName must be a string').trim().escape(),
      body('chatResult').isString().withMessage('ChatResult must be a string').trim().escape(),
      body('email').optional().isEmail().withMessage('Invalid email address').normalizeEmail(),
      body('phoneNumber').optional().isString().withMessage('PhoneNumber must be a string').trim().escape(),
      body('role').isString().withMessage('Role is required').trim().escape(),
      body('specificRole').optional().isString().trim().escape(),
    ],
    async (req, res) => {
      const formData = req.body;
      const referrer = req.get('Referer');
  
      try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          console.error("Validation Errors:", errors.array());
          return res.status(400).json({ errors: errors.array() });
        }
  
        // Sanitize input data
        const sanitizedData = {
          FacebookName: validator.escape(formData.facebookName || ""),
          ChatResult: validator.escape(formData.chatResult || ""),
          Email: validator.isEmail(formData.email || "") ? validator.normalizeEmail(formData.email) : "",
          PhoneNumber: validator.escape(formData.phoneNumber || ""),
          Role: validator.escape(formData.role || ""),
          SpecificRole: formData.role === "Other" ? validator.escape(formData.specificRole || "") : "",
        };
  
        // Connect to MSSQL and insert data
        const pool = await sql.connect(dbConfig);
        const query = `
          INSERT INTO dbo.kanban_tbl (FacebookName, ChatResult, Email, PhoneNumber, Role, SpecificRole)
          VALUES (@FacebookName, @ChatResult, @Email, @PhoneNumber, @Role, @SpecificRole)
        `;
        await pool.request()
          .input('FacebookName', sql.NVarChar, sanitizedData.FacebookName)
          .input('ChatResult', sql.NVarChar, sanitizedData.ChatResult)
          .input('Email', sql.NVarChar, sanitizedData.Email)
          .input('PhoneNumber', sql.NVarChar, sanitizedData.PhoneNumber)
          .input('Role', sql.NVarChar, sanitizedData.Role)
          .input('SpecificRole', sql.NVarChar, sanitizedData.SpecificRole)
          .query(query);
  
        const successMessage = encodeURIComponent("Form submitted successfully!");
        res.redirect(`${referrer}?success=${successMessage}`);
      } catch (err) {
        console.error("Database Error:", err);
        const errorMessage = encodeURIComponent("Error saving data to database");
        res.redirect(`${referrer}?error=${errorMessage}`);
      } finally {
        sql.close();
      }
    }
  );
  
module.exports = router;

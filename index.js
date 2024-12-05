// Initialize necessary tools
let express = require("express");
const session = require('express-session');

let app = express();

app.use(session({
    secret: 'turtleshelter-session-123',
    resave: false,
    saveUninitialized: false
}));

let path = require("path");

let bodyParser = require('body-parser');

const port = process.env.PORT || 5000;

let security = false;

// Set up EJS view
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Connect to database
const knex = require("knex") ({
    client : "pg",
    connection : {
        host : "database-1.c7oymg6a6oyf.us-east-1.rds.amazonaws.com",
        user : "postgres",
        password : "bryceellaalainarex123",
        database : "TSP_Information",
        port : 5432,
        ssl: { rejectUnauthorized: false }
    }
});

app.get('/', (req, res) => {
    res.render('index', { user: req.session.user })
});

app.get('/eventForm', (req, res) => {
    res.render('eventForm')
});

app.get('/volunteerOpportunities', async (req, res) => {
    try {
        // Fetch active events using Knex query builder
        const event = await knex('events')
            .where('event_status', 'APPROVED')
            .orderBy('event_date', 'asc');
        
        // Render the volunteer events page
        res.render('volunteerOpportunities', { event });
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).send('Error loading events');
    }
});

app.get('/jensStory', (req, res) => {
    res.render('jensStory')
});

app.get('/volunteerForm', (req, res) => {
    res.render('volunteerForm')
});

app.get('/help', (req, res) => {
    res.render('help')
});

app.get('/donate', (req, res) => {
    res.render('donate')
});

app.get('/contactUs', (req, res) => {
    res.render('contactUs')
})

app.get('/login', (req, res) => {
    res.render('login')
});

app.get('/success', (req, res) => {
    res.render('success')
});

//admin permissions, renders admin button
// app.get('/admin', (req, res) => {
//     knex('volunteers').where('vol_type', 'A').then(admin => {
//         res.render('admin', {admin})
//     })
// });  //Changed

app.get('/admin', (req, res) => {
    if (!req.session.user || req.session.user.vol_type !== 'A') {
        return res.redirect('/login');
    }
    
    knex('volunteers').where('vol_type', 'A').then(admin => {
        res.render('admin', {admin, user: req.session.user})
    });
});

//basic volunteer permissions, loads volunteer opportunities button
app.get('/admin', (req, res) => {
    knex('volunteers').where('vol_type', 'B').then(admin => {
        res.render('admin', {admin})
    })
});

app.get('/editAdmin/:id', (req, res) => {
    knex('volunteers').where('volunteer_id', req.params.id).first()
    .then(admin => {
        res.render('editAdmin', {admin})
    })
});

app.post('/editAdmin/:id', (req, res) => {
    knex('volunteers').where('volunteer_id', req.params.id)
    .update({
        vol_first_name: req.body.vol_first_name,
        vol_last_name: req.body.vol_last_name,
        vol_email: req.body.vol_email,
        vol_phone: req.body.vol_phone,
        vol_address: req.body.vol_address,
        vol_city: req.body.vol_city,
        vol_state: req.body.vol_state,
        vol_zipcode: req.body.vol_zipcode,
        username: req.body.username
    })
    .then(admin => {
        res.redirect('/admin')
    })
});

app.get('/addAdmin', (req, res) => {
    res.render('addAdmin')
});

app.post('/addAdmin', (req, res) => {
    knex('volunteers')
    .insert({
        vol_first_name: req.body.vol_first_name,
        vol_last_name: req.body.vol_last_name,
        vol_email: req.body.vol_email,
        vol_phone: req.body.vol_phone,
        vol_address: req.body.vol_address,
        vol_city: req.body.vol_city,
        vol_state: req.body.vol_state,
        vol_zipcode: req.body.vol_zipcode,
        vol_sewing_level: req.body.vol_sewing_level,
        vol_available_monthly_hours: req.body.vol_available_monthly_hours,
        username: req.body.username,
        password: req.body.password,
        vol_type: 'A'
    })
    .then(admin => {
        res.redirect('/admin')
    })
});

app.post('/deleteAdmin/:id', (req, res) => {
    knex('volunteers').where('volunteer_id', req.params.id).del()
    .then(admin => {
        res.redirect('/admin')
    })
});

app.get('/eventRequests', (req, res) => {
    knex('events').join('contacts', 'events.contact_id', '=','contacts.contact_id').select(
        'events.event_id',
        'events.event_name',
        'events.event_date',
        'events.event_address',
        'events.event_city',
        'events.event_state',
        'events.event_zipcode',
        'events.event_start_time',
        'events.event_end_time',
        'contacts.event_contact_organization as contact_org',
        'events.event_status'
    )
    .then(event => {
        knex('contacts').then(contact => {
            res.render('eventRequests', {event, contact})
        })
    })
});

app.get('/editEvent/:id', (req, res) => {
    let event, contact;

    // Step 1: Fetch the event data
    knex('events')
        .where('event_id', req.params.id)
        .first()
        .then(data => {
            event = data;

            // Step 2: Fetch the contact data using the contact_id from the event
            return knex('contacts')
                .where('contact_id', event.contact_id)
                .first();
        })
        .then(data => {
            contact = data;

            // Step 3: Render the editEvent view with the event and contact data
            res.render('editEvent', { event, contact });
        })
        .catch(error => {
            console.error(error);
            res.status(500).send('Error retrieving event and contact data');
        });
});

app.post('/editEvent/:id', (req, res) => {
    knex('events').where('event_id', req.params.id)
    .update({
        event_name: req.body.event_name,
        event_date: req.body.event_date,
        event_address: req.body.event_address,
        event_city: req.body.event_city,
        event_state: req.body.event_state,
        event_zipcode: req.body.event_zipcode,
        event_start_time: req.body.event_start_time,
        event_end_time: req.body.event_end_time,
        jen_story: req.body.jen_story,
        event_status_description: req.body.event_status_description,
        num_untrained_participants: req.body.num_untrained_participants,
        num_trained_participants: req.body.num_trained_participants,
        num_part_children: req.body.num_part_children,
        num_volunteers: req.body.num_volunteers,
        num_sewers: req.body.num_sewers,
        event_type: req.body.event_type,
        num_sewing_machines_needed: req.body.num_sewing_machines_needed,
        num_sergers_needed: req.body.num_sergers_needed,
        venue_capacity: req.body.venue_capacity,
        num_tables_round: req.body.num_tables_round,
        round_table_capacity: req.body.round_table_capacity,
        num_tables_rectangular: req.body.num_tables_rectangular,
        rectangle_table_capacity: req.body.rectangle_table_capacity,
        total_production: req.body.total_production,
        comments: req.body.comments,
        event_status: req.body.event_status
    })
    .then(event => {
        res.redirect('/eventRequests')
    })
})

app.get('/volunteer', (req, res) => {
    knex('volunteers').join('finding_sources', 'volunteers.vol_finding_source', '=','finding_sources.source_id')
    .select(
        'volunteers.volunteer_id',
        'volunteers.vol_first_name',
        'volunteers.vol_last_name',
        'volunteers.vol_email',
        'volunteers.vol_phone',
        'volunteers.vol_address',
        'volunteers.vol_city',
        'volunteers.vol_state',
        'volunteers.vol_zipcode',
        'volunteers.vol_sewing_level',
        'volunteers.vol_available_monthly_hours',
        'finding_sources.source_type as vol_finding_source'
    ).where('vol_type', 'B')
    .then(volunteer => {
        res.render('volunteer', {volunteer})
    })
       
    });

// app.post('/login', async (req, res) => {
//     let username = req.body.username;
//     let password = req.body.password;
//     console.log('Username:', username);
//     console.log('Password:', password);
  
//     try {
//       // Query the database for the user
//       let user = await knex('volunteers').select('username', 'password', 'vol_type').where('username', username).first();
  
//       console.log('Retrieved user:', user);
//       console.log('Type: ', user.vol_type)
  
//       if (!user) {
//         return res.status(401).json({ error: 'Invalid username' });
//       }
  
//       const isPasswordValid = user.password === password;
  
//       if (!isPasswordValid) {
//         return res.status(401).json({ error: 'Invalid password' });
//       }

//       if (user.vol_type == 'B') {
//         return res.status(401).json({ error: 'Unauthorized login' })
//       }
  
//       // Render the specific page if credentials are valid
//       return res.status(200).json({ message: 'Login successful!' });
//     } catch (error) {
//       console.error('Error during login:', error);
//       res.status(500).json({ error: 'An error occurred. Please try again later.' });
//     }
//   });

//Changes here
app.post('/login', async (req, res) => {
    try {
        let user = await knex('volunteers')
            .select('username', 'password', 'vol_type')
            .where('username', req.body.username)
            .first();
            
        if (!user || user.password !== req.body.password) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        req.session.user = {
            username: user.username,
            vol_type: user.vol_type
        };

        return res.status(200).json({ message: 'Login successful!' });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});//Changes end here



app.get('/editVolunteer/:id', (req, res) => {
    knex('volunteers').where('volunteer_id', req.params.id).first()
    .then(volunteer => {
        knex('finding_sources').then(finding_source => {
            res.render('editVolunteer', {volunteer, finding_source})
        })
    })
});

app.post('/editVolunteer/:id', (req, res) => {
    knex('volunteers').where('volunteer_id', req.params.id)
    .update({
        vol_first_name: req.body.vol_first_name,
        vol_last_name: req.body.vol_last_name,
        vol_email: req.body.vol_email,
        vol_phone: req.body.vol_phone,
        vol_address: req.body.vol_address,
        vol_city: req.body.vol_city,
        vol_state: req.body.vol_state,
        vol_zipcode: req.body.vol_zipcode,
        vol_sewing_level: req.body.vol_sewing_level,
        vol_available_monthly_hours: req.body.vol_available_monthly_hours,
        vol_finding_source: req.body.vol_finding_source
    })
    .then(volunteer => {
        res.redirect('/volunteer')
    })
});

app.post('/deleteVolunteer/:id', (req, res) => {
    knex('volunteers').where('volunteer_id', req.params.id).del()
    .then(volunteer => {
        res.redirect('/volunteer')
    })
});

app.get('/addVolunteer', (req, res) => {
    knex('finding_sources').then(finding_source => {
        res.render('addVolunteer', {finding_source})
    })
})

app.post('/addVolunteer', (req, res) => {
    knex('volunteers').insert({
        vol_first_name: req.body.vol_first_name,
        vol_last_name: req.body.vol_last_name,
        vol_email: req.body.vol_email,
        vol_phone: req.body.vol_phone,
        vol_address: req.body.vol_address,
        vol_city: req.body.vol_city,
        vol_state: req.body.vol_state,
        vol_zipcode: req.body.vol_zipcode,
        vol_sewing_level: req.body.vol_sewing_level,
        vol_available_monthly_hours: req.body.vol_available_monthly_hours,
        vol_finding_source: req.body.vol_finding_source,
        vol_type: 'B'
    })
    .then(volunteer => {
        res.redirect('/volunteer')
    })
});

app.get('/sponsors', (req, res) => {
    res.render('sponsors')
});

// Add after your other requires
const nodemailer = require('nodemailer');

// Create email transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'thecoolbears1.8@gmail.com',
        pass: 'rwqicsfinurxhfzd'
    }
});

// Add this with your other routes
app.post('/api/contact', async (req, res) => {
    const { firstName, lastName, email, subject, message } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !subject || !message) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    // Create email content
    const mailOptions = {
        from: 'thecoolbears1.8@gmail.com',
        to: 'thecoolbears1.8@gmail.com',
        subject: `Contact Form: ${subject}`,
        html: `
            <h2>New Contact Form Submission</h2>
            <p><strong>Name:</strong> ${firstName} ${lastName}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Subject:</strong> ${subject}</p>
            <p><strong>Message:</strong></p>
            <p>${message}</p>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'Email sent successfully' });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ error: 'Failed to send email' });
    }
});

app.get('/calendar', (req, res) => {
    res.render('calendar')
});

app.post('/deleteEvent/:id', (req, res) => {
    knex('events').where('event_id', req.params.id).del()
    .then(() => {
        res.redirect('/eventRequests')
    })
});

app.get('/addEvent', (req, res) => {
    res.redirect('/eventForm')
});

app.post('/submitEvent', async (req, res) => {
    try {
        // First log all incoming values
        console.log('Raw form data:', req.body);

        // Insert contact first
        const [{ contact_id }] = await knex('contacts')
            .insert({
                event_contact_first_name: req.body.event_contact_first_name,
                event_contact_last_name: req.body.event_contact_last_name,
                event_contact_phone: req.body.event_contact_phone,
                event_contact_email: req.body.event_contact_email,
                event_contact_organization: req.body.event_contact_organization
            })
            .returning('contact_id');

        // Helper function to safely parse integers with detailed logging
        const safeParseInt = (value, fieldName) => {
            console.log(`Processing ${fieldName}:`, {
                originalValue: value,
                type: typeof value,
                isEmpty: value === '',
                parsedValue: parseInt(value || 0)
            });
            
            if (value === '') {
                console.log(`Warning: Empty string detected for ${fieldName}, defaulting to 0`);
                return 0;
            }
            
            const parsed = parseInt(value || 0);
            if (isNaN(parsed)) {
                throw new Error(`Invalid integer value for ${fieldName}: ${value}`);
            }
            return parsed;
        };

        // Create event data object with detailed logging
        const eventData = {
            event_name: req.body.event_name.toUpperCase(),
            event_date: req.body.event_date,
            event_address: req.body.event_address.toUpperCase(),
            event_city: req.body.event_city.toUpperCase(),
            event_state: req.body.event_state.toUpperCase(),
            event_zipcode: req.body.event_zip_code,
            event_start_time: req.body.event_start_time,
            event_end_time: req.body.event_end_time,
            event_status_description: '',
            event_status: 'PENDING',
            event_type: req.body.type_of_event.toUpperCase(),
            comments: req.body.comments.toUpperCase() || '',
            contact_id: contact_id,
            
            // Integer fields with safe parsing
            num_untrained_participants: safeParseInt(req.body.num_untrained_participants, 'num_untrained_participants'),
            num_trained_participants: safeParseInt(req.body.num_trained_participants, 'num_trained_participants'),
            num_part_children: req.body.num_children ? safeParseInt(req.body.num_children, 'num_children') : null,
            num_volunteers: safeParseInt(req.body.num_volunteers, 'num_volunteers'),
            num_sewers: safeParseInt(req.body.num_sewers, 'num_sewers'),
            jen_story: safeParseInt(req.body.jen_story_length, 'jen_story_length'),
            num_sewing_machines_needed: safeParseInt(req.body.num_machines, 'num_sewing_machines_needed'),
            num_sergers_needed: safeParseInt(req.body.num_sergers, 'num_sergers_needed'),
            venue_capacity: safeParseInt(req.body.venue_capacity, 'venue_capacity'),
            num_tables_round: safeParseInt(req.body.num_tables_round, 'num_tables_round'),
            round_table_capacity: safeParseInt(req.body.round_seating, 'round_table_capacity'),
            num_tables_rectangular: safeParseInt(req.body.num_tables_rectangular, 'num_tables_rectangular'),
            rectangle_table_capacity: safeParseInt(req.body.rectangular_seating, 'rectangle_table_capacity'),
            total_production: safeParseInt(req.body.total_production, 'total_production')
        };

        console.log('Final event data to be inserted:', eventData);

        // Insert the event
        await knex('events').insert(eventData);
        
        res.redirect('/help');
    } catch (err) {
        console.error('Error details:', {
            message: err.message,
            stack: err.stack,
            body: req.body
        });
        res.status(500).json({ 
            error: 'An error occurred while inserting the event.',
            details: err.message,
            requestBody: req.body // Include the request body in the error response
        });
    }
});

app.post("/volunteer_form", (req, res) => {
    // Add debugging logs
    console.log("Form submission received");
    console.log("Request body:", req.body);

    knex("volunteers").insert({
        vol_first_name: req.body.vol_first_name.toUpperCase(),
        vol_last_name: req.body.vol_last_name.toUpperCase(),
        vol_email: req.body.vol_email.toUpperCase(),
        vol_phone: req.body.vol_phone,
        vol_address: req.body.vol_address.toUpperCase(),
        vol_city: req.body.vol_city.toUpperCase(),
        vol_state: req.body.vol_state.toUpperCase(),
        vol_sewing_level: req.body.vol_sewing_level.toUpperCase(),
        vol_available_monthly_hours: req.body.vol_available_monthly_hours,
        vol_zipcode: req.body.vol_zipcode,
        vol_finding_source: req.body.vol_finding_source.toUpperCase(),
        vol_type: "B",
        travel_radius: req.body.travel_radius
    })
    .then(() => {
        console.log("Successfully inserted volunteer data");
        res.redirect("/help");
    })
    .catch(err => {
        console.error("Database error:", err);
        res.status(500).send("Error saving volunteer information");
    });
});

app.get('/adminAddEvent', (req, res) => {
    res.render('adminAddEvent')
});

app.post('/adminSubmitEvent', async (req, res) => {
    try {
        // First log all incoming values
        console.log('Raw form data:', req.body);

        // Insert contact first
        const [{ contact_id }] = await knex('contacts')
            .insert({
                event_contact_first_name: req.body.event_contact_first_name,
                event_contact_last_name: req.body.event_contact_last_name,
                event_contact_phone: req.body.event_contact_phone,
                event_contact_email: req.body.event_contact_email,
                event_contact_organization: req.body.event_contact_organization
            })
            .returning('contact_id');

        // Helper function to safely parse integers with detailed logging
        const safeParseInt = (value, fieldName) => {
            console.log(`Processing ${fieldName}:`, {
                originalValue: value,
                type: typeof value,
                isEmpty: value === '',
                parsedValue: parseInt(value || 0)
            });
            
            if (value === '') {
                console.log(`Warning: Empty string detected for ${fieldName}, defaulting to 0`);
                return 0;
            }
            
            const parsed = parseInt(value || 0);
            if (isNaN(parsed)) {
                throw new Error(`Invalid integer value for ${fieldName}: ${value}`);
            }
            return parsed;
        };

        // Create event data object with detailed logging
        const eventData = {
            event_name: req.body.event_name.toUpperCase(),
            event_date: req.body.event_date,
            event_address: req.body.event_address.toUpperCase(),
            event_city: req.body.event_city.toUpperCase(),
            event_state: req.body.event_state.toUpperCase(),
            event_zipcode: req.body.event_zip_code,
            event_start_time: req.body.event_start_time,
            event_end_time: req.body.event_end_time,
            event_status_description: '',
            event_status: 'PENDING',
            event_type: req.body.type_of_event.toUpperCase(),
            comments: req.body.comments.toUpperCase() || '',
            contact_id: contact_id,
            
            // Integer fields with safe parsing
            num_untrained_participants: safeParseInt(req.body.num_untrained_participants, 'num_untrained_participants'),
            num_trained_participants: safeParseInt(req.body.num_trained_participants, 'num_trained_participants'),
            num_part_children: req.body.num_children ? safeParseInt(req.body.num_children, 'num_children') : null,
            num_volunteers: safeParseInt(req.body.num_volunteers, 'num_volunteers'),
            num_sewers: safeParseInt(req.body.num_sewers, 'num_sewers'),
            jen_story: safeParseInt(req.body.jen_story_length, 'jen_story_length'),
            num_sewing_machines_needed: safeParseInt(req.body.num_machines, 'num_sewing_machines_needed'),
            num_sergers_needed: safeParseInt(req.body.num_sergers, 'num_sergers_needed'),
            venue_capacity: safeParseInt(req.body.venue_capacity, 'venue_capacity'),
            num_tables_round: safeParseInt(req.body.num_tables_round, 'num_tables_round'),
            round_table_capacity: safeParseInt(req.body.round_seating, 'round_table_capacity'),
            num_tables_rectangular: safeParseInt(req.body.num_tables_rectangular, 'num_tables_rectangular'),
            rectangle_table_capacity: safeParseInt(req.body.rectangular_seating, 'rectangle_table_capacity'),
            total_production: safeParseInt(req.body.total_production, 'total_production')
        };

        console.log('Final event data to be inserted:', eventData);

        // Insert the event
        await knex('events').insert(eventData);
        
        res.redirect('/eventRequests');
    } catch (err) {
        console.error('Error details:', {
            message: err.message,
            stack: err.stack,
            body: req.body
        });
        res.status(500).json({ 
            error: 'An error occurred while inserting the event.',
            details: err.message,
            requestBody: req.body // Include the request body in the error response
        });
    }
});

app.listen(port, () => console.log('Listening...'));
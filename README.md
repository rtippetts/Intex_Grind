# Intex_Grind

## This is the website for the Turtle Shell Project. The main aim of this site is to allow volunteers, organizations, and admins to manage events.

URL: _______

*Volunteers* can come to the website and submit their information to be contacted by an admin for volunteer opportunities.

*Organizations* and individuals can come to the site to request an event and will be contacted by the admin.

*Admins* can login and see or edit dashboard overviews, volunteers, and event information.

## Page Overview

### Home Page (Anonymous User)

This is the main landing page for non-authenticated anonymous users. This page has tabs at the top that allow the user to learn more about the organization, how they can help, and sign up to be volunteers.

#### Jen's Story

This takes the user to a page the features the origin of the TSP.

#### How You Can Help

This takes the user to a page where they can choose to either sign up to be a volunteer or request an event.

  #### Event Request

  The Event Request page connects to the events table in our PostgreSQL server. 

  #### Volunteer Form

  The volunteer form connects to the volunteers form in our PostgreSQL server.

#### Our Sponsors

This takes the user to a page representing all our sponsors.

#### Contact US

The Contact Us page takes the user to a form that auto-sends an email to the admin gmail account. This is really cool!

#### Donate

This takes the user to the external donatation system that TSP uses.

### Login Page 

This is a simple login page for admins to authenticate and gain access to organization data and events.

**Admin login** 
In order to login as an admin and see this page, use the following credentials:

  ***USERNAME: jsmith***
  ***PASSWORD: password123***

### Home Page (Admin)

This home page is set to be a different color than the non-authenticated page so the admin knows they are logged in. The landing page after login is the dashboard. This allows the admin to see organization data about previous events, event status, and insights on what the organization is doing well or needs to improve. Due to lack of access to Tableau server, this must be refreshed manually.

**How To Refresh Dashboard**

This refresh needs to be done when new data is uploaded into PostgreSQL or the Tableau charts have been changed. Data admin password and username are required to do this.

1. Open the Tableau file
2. Refresh and re-save to Tableau Public
3. Refresh the webpage

#### Volunteer Information

This page shows information from the volunteer table in our PostgreSQL server. Click on the buttons to edit, delete, and add volunteers. All persons who interact with the organization are considered "volunteers" and their site access is specified in this table as either admin or basic access.

#### Events

This page shows information from the events table. The inital table shows the most pertinent information and the admin can click to view more, edit, or delete. This format makes the table less overwhelming for the admin.

#### Calendar

This connects to the organization's Google calender of events. This is also really cool!

#### Email

This opens gmail for the admin so they can view any contact requests that were made in the aforementioned Contact Us page. The admin must be logged into the organization's email to view the inbox. 





-- ============================================================
-- HMS (Hospital Management System) - Database Schema & Seed Data
-- MySQL 8 - run this file to create and populate hms_db
-- ============================================================

DROP DATABASE IF EXISTS hms_db;
CREATE DATABASE hms_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE hms_db;

-- ------------------------------------------------------------
-- TABLE: users
-- ------------------------------------------------------------
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin','doctor','nurse','pharmacist','lab_technician','receptionist') NOT NULL,
    status ENUM('active','inactive') NOT NULL DEFAULT 'active',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- TABLE: departments
-- (head_doctor_id FK added later, after doctors table exists)
-- ------------------------------------------------------------
CREATE TABLE departments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    head_doctor_id INT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- TABLE: doctors
-- ------------------------------------------------------------
CREATE TABLE doctors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    specialization VARCHAR(100),
    department_id INT,
    qualification VARCHAR(150),
    phone VARCHAR(20),
    status ENUM('active','inactive') NOT NULL DEFAULT 'active',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_doctors_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_doctors_department FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
) ENGINE=InnoDB;

ALTER TABLE departments
    ADD CONSTRAINT fk_departments_head_doctor FOREIGN KEY (head_doctor_id) REFERENCES doctors(id) ON DELETE SET NULL;

-- ------------------------------------------------------------
-- TABLE: staff (nurses, pharmacists, lab technicians, receptionists)
-- ------------------------------------------------------------
CREATE TABLE staff (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    department_id INT,
    role_title VARCHAR(100),
    phone VARCHAR(20),
    status ENUM('active','inactive') NOT NULL DEFAULT 'active',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_staff_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_staff_department FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- TABLE: patients
-- ------------------------------------------------------------
CREATE TABLE patients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_number VARCHAR(20) NOT NULL UNIQUE,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    dob DATE,
    gender ENUM('male','female','other'),
    blood_group VARCHAR(5),
    phone VARCHAR(20),
    email VARCHAR(100),
    address VARCHAR(255),
    next_of_kin VARCHAR(100),
    next_of_kin_phone VARCHAR(20),
    registered_by INT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_patients_registered_by FOREIGN KEY (registered_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- TABLE: appointments
-- ------------------------------------------------------------
CREATE TABLE appointments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    appointment_number VARCHAR(20) NOT NULL UNIQUE,
    patient_id INT NOT NULL,
    doctor_id INT NOT NULL,
    department_id INT,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    type VARCHAR(50),
    status ENUM('scheduled','completed','cancelled','no-show') NOT NULL DEFAULT 'scheduled',
    notes TEXT,
    created_by INT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_appt_patient FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE RESTRICT,
    CONSTRAINT fk_appt_doctor FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE RESTRICT,
    CONSTRAINT fk_appt_department FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
    CONSTRAINT fk_appt_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- TABLE: medical_records
-- ------------------------------------------------------------
CREATE TABLE medical_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    doctor_id INT NOT NULL,
    appointment_id INT,
    diagnosis TEXT,
    symptoms TEXT,
    treatment TEXT,
    prescription_notes TEXT,
    follow_up_date DATE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_mr_patient FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE RESTRICT,
    CONSTRAINT fk_mr_doctor FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE RESTRICT,
    CONSTRAINT fk_mr_appointment FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- TABLE: pharmacy_drugs
-- ------------------------------------------------------------
CREATE TABLE pharmacy_drugs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    drug_name VARCHAR(150) NOT NULL,
    category VARCHAR(100),
    description TEXT,
    unit VARCHAR(30),
    unit_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    quantity_in_stock INT NOT NULL DEFAULT 0,
    reorder_level INT NOT NULL DEFAULT 10,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- TABLE: prescriptions
-- ------------------------------------------------------------
CREATE TABLE prescriptions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    doctor_id INT NOT NULL,
    appointment_id INT,
    status ENUM('pending','dispensed') NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_presc_patient FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE RESTRICT,
    CONSTRAINT fk_presc_doctor FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE RESTRICT,
    CONSTRAINT fk_presc_appointment FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- TABLE: prescription_items
-- ------------------------------------------------------------
CREATE TABLE prescription_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    prescription_id INT NOT NULL,
    drug_id INT NOT NULL,
    dosage VARCHAR(100),
    quantity INT NOT NULL DEFAULT 1,
    instructions VARCHAR(255),
    CONSTRAINT fk_pi_prescription FOREIGN KEY (prescription_id) REFERENCES prescriptions(id) ON DELETE CASCADE,
    CONSTRAINT fk_pi_drug FOREIGN KEY (drug_id) REFERENCES pharmacy_drugs(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- TABLE: lab_tests
-- ------------------------------------------------------------
CREATE TABLE lab_tests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    test_name VARCHAR(150) NOT NULL,
    description TEXT,
    normal_range VARCHAR(100),
    unit VARCHAR(30),
    price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- TABLE: lab_requests
-- ------------------------------------------------------------
CREATE TABLE lab_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    request_number VARCHAR(20) NOT NULL UNIQUE,
    patient_id INT NOT NULL,
    doctor_id INT NOT NULL,
    appointment_id INT,
    status ENUM('requested','processing','completed') NOT NULL DEFAULT 'requested',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_lr_patient FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE RESTRICT,
    CONSTRAINT fk_lr_doctor FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE RESTRICT,
    CONSTRAINT fk_lr_appointment FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- TABLE: lab_request_items
-- ------------------------------------------------------------
CREATE TABLE lab_request_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    request_id INT NOT NULL,
    test_id INT NOT NULL,
    result VARCHAR(255),
    result_notes TEXT,
    status ENUM('pending','completed') NOT NULL DEFAULT 'pending',
    processed_at TIMESTAMP NULL,
    CONSTRAINT fk_lri_request FOREIGN KEY (request_id) REFERENCES lab_requests(id) ON DELETE CASCADE,
    CONSTRAINT fk_lri_test FOREIGN KEY (test_id) REFERENCES lab_tests(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- TABLE: bills
-- ------------------------------------------------------------
CREATE TABLE bills (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bill_number VARCHAR(20) NOT NULL UNIQUE,
    patient_id INT NOT NULL,
    appointment_id INT,
    subtotal DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    discount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    total DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    status ENUM('unpaid','partial','paid') NOT NULL DEFAULT 'unpaid',
    created_by INT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_bills_patient FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE RESTRICT,
    CONSTRAINT fk_bills_appointment FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE SET NULL,
    CONSTRAINT fk_bills_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- TABLE: bill_items
-- ------------------------------------------------------------
CREATE TABLE bill_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bill_id INT NOT NULL,
    description VARCHAR(255) NOT NULL,
    category ENUM('consultation','lab','pharmacy','other') NOT NULL DEFAULT 'other',
    quantity INT NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    total DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    CONSTRAINT fk_bi_bill FOREIGN KEY (bill_id) REFERENCES bills(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- TABLE: payments
-- ------------------------------------------------------------
CREATE TABLE payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bill_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_method ENUM('cash','card','transfer') NOT NULL DEFAULT 'cash',
    payment_date DATE NOT NULL,
    received_by INT,
    notes VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_payments_bill FOREIGN KEY (bill_id) REFERENCES bills(id) ON DELETE CASCADE,
    CONSTRAINT fk_payments_received_by FOREIGN KEY (received_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- TABLE: audit_log
-- ------------------------------------------------------------
CREATE TABLE audit_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    action VARCHAR(100) NOT NULL,
    module VARCHAR(50),
    record_id INT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_audit_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Helpful indexes for common lookups
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_patients_name ON patients(last_name, first_name);
CREATE INDEX idx_bills_status ON bills(status);
CREATE INDEX idx_lab_requests_status ON lab_requests(status);
CREATE INDEX idx_prescriptions_status ON prescriptions(status);

-- ============================================================
-- SEED DATA
-- ============================================================

-- ------------------------------------------------------------
-- USERS
-- Default passwords (bcrypt hashed, saltRounds = 10):
--   admin@hms.com          -> Admin@123
--   doctors (all 3)        -> Doctor@123
--   pharmacists (both)     -> Pharma@123
--   lab technicians (both) -> LabTech@123
--   receptionists (both)   -> Reception@123
-- ------------------------------------------------------------
INSERT INTO users (id, name, email, password, role, status) VALUES
(1, 'System Administrator', 'admin@hms.com', '$2b$10$7hTJA/zCTKhTVb4ixNYyK.Hb3pOtwx8XCYKBBmNo4rd2aMXzpResy', 'admin', 'active'),
(2, 'Dr. James Okafor', 'james.okafor@hms.com', '$2b$10$cBoAm4f4hybQypiTmE.juuvBqfna6LYbnLagRejuqyNdaUjIw8V7.', 'doctor', 'active'),
(3, 'Dr. Amina Bello', 'amina.bello@hms.com', '$2b$10$cBoAm4f4hybQypiTmE.juuvBqfna6LYbnLagRejuqyNdaUjIw8V7.', 'doctor', 'active'),
(4, 'Dr. Samuel Adeyemi', 'samuel.adeyemi@hms.com', '$2b$10$cBoAm4f4hybQypiTmE.juuvBqfna6LYbnLagRejuqyNdaUjIw8V7.', 'doctor', 'active'),
(5, 'Grace Nwosu', 'grace.nwosu@hms.com', '$2b$10$ewNcqAJ3I1RKbTGCVlRumeaIbbTetmngmfS2WRr6FuhS1eifi4ZXu', 'pharmacist', 'active'),
(6, 'Peter Eze', 'peter.eze@hms.com', '$2b$10$ewNcqAJ3I1RKbTGCVlRumeaIbbTetmngmfS2WRr6FuhS1eifi4ZXu', 'pharmacist', 'active'),
(7, 'Ifeoma Chukwu', 'ifeoma.chukwu@hms.com', '$2b$10$U4W7kPXV23IjXmBgwiysZeCh1ejeuKEDQP9a/0Kl0xDSCmNttRflq', 'lab_technician', 'active'),
(8, 'Tunde Bakare', 'tunde.bakare@hms.com', '$2b$10$U4W7kPXV23IjXmBgwiysZeCh1ejeuKEDQP9a/0Kl0xDSCmNttRflq', 'lab_technician', 'active'),
(9, 'Blessing Udo', 'blessing.udo@hms.com', '$2b$10$T1L/uq5wgM0gqQdHQ0ulA.sEyH2G.WO/okfIG3ymlgtXWKXZzoRyO', 'receptionist', 'active'),
(10, 'Chidi Obi', 'chidi.obi@hms.com', '$2b$10$T1L/uq5wgM0gqQdHQ0ulA.sEyH2G.WO/okfIG3ymlgtXWKXZzoRyO', 'receptionist', 'active');

-- ------------------------------------------------------------
-- DEPARTMENTS (head_doctor_id filled in after doctors are created)
-- ------------------------------------------------------------
INSERT INTO departments (id, name, description, head_doctor_id) VALUES
(1, 'General Medicine', 'Primary and general outpatient care', NULL),
(2, 'Cardiology', 'Diagnosis and treatment of heart conditions', NULL),
(3, 'Pediatrics', 'Medical care for infants, children and adolescents', NULL),
(4, 'Pharmacy', 'Dispensing of medication and drug inventory management', NULL),
(5, 'Laboratory', 'Diagnostic testing and sample analysis', NULL);

-- ------------------------------------------------------------
-- DOCTORS
-- ------------------------------------------------------------
INSERT INTO doctors (id, user_id, specialization, department_id, qualification, phone, status) VALUES
(1, 2, 'Cardiologist', 2, 'MBBS, FWACS (Cardiology)', '08031234501', 'active'),
(2, 3, 'Pediatrician', 3, 'MBBS, FMCPaed', '08031234502', 'active'),
(3, 4, 'General Physician', 1, 'MBBS, MWACP', '08031234503', 'active');

UPDATE departments SET head_doctor_id = 1 WHERE id = 2;
UPDATE departments SET head_doctor_id = 2 WHERE id = 3;
UPDATE departments SET head_doctor_id = 3 WHERE id = 1;

-- ------------------------------------------------------------
-- STAFF (pharmacists, lab technicians, receptionists)
-- ------------------------------------------------------------
INSERT INTO staff (id, user_id, department_id, role_title, phone, status) VALUES
(1, 5, 4, 'Pharmacist', '08041234501', 'active'),
(2, 6, 4, 'Pharmacist', '08041234502', 'active'),
(3, 7, 5, 'Lab Technician', '08051234501', 'active'),
(4, 8, 5, 'Lab Technician', '08051234502', 'active'),
(5, 9, 1, 'Receptionist', '08061234501', 'active'),
(6, 10, 1, 'Receptionist', '08061234502', 'active');

-- ------------------------------------------------------------
-- PATIENTS (20)
-- ------------------------------------------------------------
INSERT INTO patients (id, patient_number, first_name, last_name, dob, gender, blood_group, phone, email, address, next_of_kin, next_of_kin_phone, registered_by) VALUES
(1, 'PAT-0001', 'Chinedu', 'Eze', '1990-03-12', 'male', 'O+', '08101110001', 'chinedu.eze@example.com', '12 Allen Avenue, Lagos', 'Ngozi Eze', '08101110011', 9),
(2, 'PAT-0002', 'Ngozi', 'Okonkwo', '1985-07-24', 'female', 'A+', '08101110002', 'ngozi.okonkwo@example.com', '5 Awolowo Road, Lagos', 'Emeka Okonkwo', '08101110012', 9),
(3, 'PAT-0003', 'Musa', 'Ibrahim', '1978-11-02', 'male', 'B+', '08101110003', 'musa.ibrahim@example.com', '9 Ahmadu Bello Way, Abuja', 'Amina Ibrahim', '08101110013', 9),
(4, 'PAT-0004', 'Fatima', 'Yusuf', '2001-01-19', 'female', 'AB+', '08101110004', 'fatima.yusuf@example.com', '3 Ibrahim Taiwo Rd, Kano', 'Yusuf Aliyu', '08101110014', 9),
(5, 'PAT-0005', 'Emeka', 'Nwankwo', '1995-05-30', 'male', 'O-', '08101110005', 'emeka.nwankwo@example.com', '21 Zik Avenue, Enugu', 'Chioma Nwankwo', '08101110015', 9),
(6, 'PAT-0006', 'Aisha', 'Bello', '1988-09-14', 'female', 'A-', '08101110006', 'aisha.bello@example.com', '7 Murtala Mohammed Way, Kaduna', 'Bello Sani', '08101110016', 9),
(7, 'PAT-0007', 'Tunde', 'Ogunleye', '1975-12-08', 'male', 'B-', '08101110007', 'tunde.ogunleye@example.com', '15 Ring Road, Ibadan', 'Bisi Ogunleye', '08101110017', 9),
(8, 'PAT-0008', 'Chiamaka', 'Uba', '1999-04-22', 'female', 'O+', '08101110008', 'chiamaka.uba@example.com', '18 Aba Road, Port Harcourt', 'Obinna Uba', '08101110018', 9),
(9, 'PAT-0009', 'Ibrahim', 'Suleiman', '1982-06-17', 'male', 'AB-', '08101110009', 'ibrahim.suleiman@example.com', '4 Yandaki Road, Sokoto', 'Suleiman Musa', '08101110019', 9),
(10, 'PAT-0010', 'Bisola', 'Adeyemi', '1993-02-27', 'female', 'A+', '08101110010', 'bisola.adeyemi@example.com', '10 Adeola Odeku St, Lagos', 'Kunle Adeyemi', '08101110020', 9),
(11, 'PAT-0011', 'Yakubu', 'Danladi', '1970-10-05', 'male', 'O+', '08101110021', 'yakubu.danladi@example.com', '2 Bank Road, Jos', 'Danladi Musa', '08101110031', 10),
(12, 'PAT-0012', 'Grace', 'Effiong', '1992-08-11', 'female', 'B+', '08101110022', 'grace.effiong@example.com', '6 Marina Road, Calabar', 'Effiong Bassey', '08101110032', 10),
(13, 'PAT-0013', 'Segun', 'Afolabi', '1986-01-30', 'male', 'A+', '08101110023', 'segun.afolabi@example.com', '11 Oduduwa Cres, Ile-Ife', 'Afolabi Ade', '08101110033', 10),
(14, 'PAT-0014', 'Chinwe', 'Okafor', '1998-03-15', 'female', 'O-', '08101110024', 'chinwe.okafor@example.com', '8 New Market Rd, Onitsha', 'Okafor Chidi', '08101110034', 10),
(15, 'PAT-0015', 'Abdullahi', 'Garba', '1980-07-09', 'male', 'AB+', '08101110025', 'abdullahi.garba@example.com', '14 Zaria Road, Kano', 'Garba Aliyu', '08101110035', 10),
(16, 'PAT-0016', 'Funmilayo', 'Adebayo', '1991-11-21', 'female', 'A-', '08101110026', 'funmilayo.adebayo@example.com', '3 Bode Thomas St, Lagos', 'Adebayo Tolu', '08101110036', 10),
(17, 'PAT-0017', 'Chukwuemeka', 'Onyeka', '1983-05-04', 'male', 'B-', '08101110027', 'chukwuemeka.onyeka@example.com', '17 Ziks Ave, Awka', 'Onyeka Nnamdi', '08101110037', 10),
(18, 'PAT-0018', 'Hauwa', 'Abdullahi', '1996-09-28', 'female', 'O+', '08101110028', 'hauwa.abdullahi@example.com', '5 Gwarinpa Estate, Abuja', 'Abdullahi Musa', '08101110038', 10),
(19, 'PAT-0019', 'Olumide', 'Fashola', '1979-12-19', 'male', 'AB-', '08101110029', 'olumide.fashola@example.com', '9 Opebi Road, Lagos', 'Fashola Tayo', '08101110039', 10),
(20, 'PAT-0020', 'Amaka', 'Nnamdi', '1994-04-07', 'female', 'A+', '08101110030', 'amaka.nnamdi@example.com', '20 Independence Layout, Enugu', 'Nnamdi Uche', '08101110040', 10);

-- ------------------------------------------------------------
-- APPOINTMENTS (15, mixed statuses, near current date)
-- ------------------------------------------------------------
INSERT INTO appointments (id, appointment_number, patient_id, doctor_id, department_id, appointment_date, appointment_time, type, status, notes, created_by) VALUES
(1, 'APT-0001', 1, 3, 1, '2026-07-10', '09:00:00', 'Consultation', 'completed', 'Routine checkup', 9),
(2, 'APT-0002', 2, 1, 2, '2026-07-10', '10:00:00', 'Consultation', 'completed', 'Chest pain follow-up', 9),
(3, 'APT-0003', 3, 2, 3, '2026-07-11', '11:00:00', 'Consultation', 'completed', 'Child vaccination review', 10),
(4, 'APT-0004', 4, 3, 1, '2026-07-12', '09:30:00', 'Follow-up', 'completed', 'Malaria follow-up', 9),
(5, 'APT-0005', 5, 1, 2, '2026-07-14', '13:00:00', 'Consultation', 'no-show', 'Patient did not show up', 9),
(6, 'APT-0006', 6, 2, 3, '2026-07-15', '10:30:00', 'Consultation', 'cancelled', 'Rescheduled by patient', 10),
(7, 'APT-0007', 7, 3, 1, '2026-07-16', '08:30:00', 'Consultation', 'completed', 'Hypertension review', 9),
(8, 'APT-0008', 8, 1, 2, '2026-07-18', '14:00:00', 'Consultation', 'completed', 'ECG review', 9),
(9, 'APT-0009', 9, 2, 3, '2026-07-20', '09:00:00', 'Consultation', 'scheduled', 'New patient visit', 10),
(10, 'APT-0010', 10, 3, 1, '2026-07-22', '11:30:00', 'Follow-up', 'scheduled', 'Lab result review', 9),
(11, 'APT-0011', 11, 1, 2, '2026-07-24', '09:00:00', 'Consultation', 'scheduled', 'Cardiac assessment', 9),
(12, 'APT-0012', 12, 2, 3, '2026-07-25', '10:00:00', 'Consultation', 'scheduled', 'Pediatric checkup', 10),
(13, 'APT-0013', 13, 3, 1, '2026-07-27', '15:00:00', 'Consultation', 'scheduled', 'General checkup', 9),
(14, 'APT-0014', 14, 1, 2, '2026-07-29', '09:30:00', 'Consultation', 'scheduled', 'Follow-up on medication', 9),
(15, 'APT-0015', 15, 2, 3, '2026-07-30', '10:00:00', 'Consultation', 'scheduled', 'Growth monitoring', 10);

-- ------------------------------------------------------------
-- MEDICAL RECORDS (for completed appointments)
-- ------------------------------------------------------------
INSERT INTO medical_records (patient_id, doctor_id, appointment_id, diagnosis, symptoms, treatment, prescription_notes, follow_up_date) VALUES
(1, 3, 1, 'Mild hypertension', 'Headache, occasional dizziness', 'Lifestyle modification, low-salt diet', 'Amlodipine 5mg once daily', '2026-08-10'),
(2, 1, 2, 'Angina pectoris', 'Chest tightness on exertion', 'Beta-blocker therapy, ECG monitoring', 'Atenolol 50mg once daily', '2026-08-05'),
(3, 2, 3, 'Routine immunization', 'None - scheduled vaccination', 'Administered scheduled vaccine dose', 'Paracetamol syrup if fever occurs', NULL),
(4, 3, 4, 'Resolved malaria', 'Previously had fever and chills', 'Completed antimalarial course', 'No further medication needed', NULL),
(7, 3, 7, 'Essential hypertension', 'Elevated blood pressure on review', 'Continue antihypertensive, monitor BP weekly', 'Lisinopril 10mg once daily', '2026-08-16'),
(8, 1, 8, 'Normal sinus rhythm', 'Occasional palpitations', 'Reassurance, lifestyle advice', 'None', NULL);

-- ------------------------------------------------------------
-- PHARMACY DRUGS (10, some below reorder level = low stock)
-- ------------------------------------------------------------
INSERT INTO pharmacy_drugs (id, drug_name, category, description, unit, unit_price, quantity_in_stock, reorder_level) VALUES
(1, 'Paracetamol 500mg', 'Analgesic', 'Pain reliever and fever reducer', 'Tablet', 20.00, 500, 50),
(2, 'Amoxicillin 500mg', 'Antibiotic', 'Broad-spectrum antibiotic capsule', 'Capsule', 45.00, 300, 50),
(3, 'Amlodipine 5mg', 'Antihypertensive', 'Calcium channel blocker for hypertension', 'Tablet', 60.00, 8, 30),
(4, 'Atenolol 50mg', 'Beta-blocker', 'Used to treat angina and hypertension', 'Tablet', 55.00, 120, 30),
(5, 'Lisinopril 10mg', 'ACE Inhibitor', 'Used to treat high blood pressure', 'Tablet', 65.00, 15, 30),
(6, 'Artemether/Lumefantrine', 'Antimalarial', 'Combination therapy for malaria', 'Tablet', 850.00, 200, 40),
(7, 'Paracetamol Syrup', 'Analgesic', 'Pediatric fever and pain relief syrup', 'Bottle', 350.00, 5, 20),
(8, 'Metformin 500mg', 'Antidiabetic', 'Used to control blood sugar levels', 'Tablet', 40.00, 250, 40),
(9, 'Ibuprofen 400mg', 'NSAID', 'Anti-inflammatory pain reliever', 'Tablet', 25.00, 400, 50),
(10, 'Vitamin C 1000mg', 'Supplement', 'Immune support supplement', 'Tablet', 30.00, 6, 25);

-- ------------------------------------------------------------
-- PRESCRIPTIONS + ITEMS
-- ------------------------------------------------------------
INSERT INTO prescriptions (id, patient_id, doctor_id, appointment_id, status) VALUES
(1, 1, 3, 1, 'dispensed'),
(2, 2, 1, 2, 'dispensed'),
(3, 7, 3, 7, 'pending'),
(4, 8, 1, 8, 'pending');

INSERT INTO prescription_items (prescription_id, drug_id, dosage, quantity, instructions) VALUES
(1, 3, '5mg once daily', 30, 'Take in the morning with food'),
(2, 4, '50mg once daily', 30, 'Take at the same time every day'),
(3, 5, '10mg once daily', 30, 'Take in the morning, monitor BP weekly'),
(4, 9, '400mg as needed', 20, 'Take after meals for pain relief');

-- ------------------------------------------------------------
-- LAB TESTS (8)
-- ------------------------------------------------------------
INSERT INTO lab_tests (id, test_name, description, normal_range, unit, price) VALUES
(1, 'Complete Blood Count (CBC)', 'Evaluates overall blood health', '4.5 - 11.0', 'x10^9/L', 3500.00),
(2, 'Fasting Blood Sugar', 'Measures blood glucose after fasting', '70 - 100', 'mg/dL', 1500.00),
(3, 'Malaria Parasite Test', 'Detects presence of malaria parasites', 'Negative', 'N/A', 2000.00),
(4, 'Lipid Profile', 'Measures cholesterol and triglycerides', '< 200', 'mg/dL', 5000.00),
(5, 'Liver Function Test', 'Assesses liver enzyme levels', '7 - 56', 'U/L', 6000.00),
(6, 'Kidney Function Test', 'Assesses renal function via creatinine/urea', '0.6 - 1.3', 'mg/dL', 5500.00),
(7, 'Urinalysis', 'Physical, chemical and microscopic urine exam', 'Normal', 'N/A', 1800.00),
(8, 'HIV Screening', 'Screens for HIV antibodies', 'Non-reactive', 'N/A', 2500.00);

-- ------------------------------------------------------------
-- LAB REQUESTS + ITEMS
-- ------------------------------------------------------------
INSERT INTO lab_requests (id, request_number, patient_id, doctor_id, appointment_id, status) VALUES
(1, 'LAB-0001', 2, 1, 2, 'completed'),
(2, 'LAB-0002', 7, 3, 7, 'completed'),
(3, 'LAB-0003', 8, 1, 8, 'processing'),
(4, 'LAB-0004', 10, 3, 10, 'requested');

INSERT INTO lab_request_items (request_id, test_id, result, result_notes, status, processed_at) VALUES
(1, 4, '210 mg/dL', 'Slightly elevated cholesterol, dietary advice given', 'completed', '2026-07-10 15:00:00'),
(1, 1, '6.2 x10^9/L', 'Within normal range', 'completed', '2026-07-10 15:05:00'),
(2, 2, '95 mg/dL', 'Normal fasting glucose', 'completed', '2026-07-16 12:00:00'),
(3, 1, NULL, NULL, 'pending', NULL),
(4, 6, NULL, NULL, 'pending', NULL);

-- ------------------------------------------------------------
-- BILLS + BILL ITEMS + PAYMENTS (5 bills, mixed paid/unpaid)
-- ------------------------------------------------------------
INSERT INTO bills (id, bill_number, patient_id, appointment_id, subtotal, discount, total, status, created_by) VALUES
(1, 'BILL-0001', 1, 1, 5000.00, 0.00, 5000.00, 'paid', 9),
(2, 'BILL-0002', 2, 2, 10500.00, 500.00, 10000.00, 'paid', 9),
(3, 'BILL-0003', 7, 7, 7500.00, 0.00, 7500.00, 'partial', 9),
(4, 'BILL-0004', 8, 8, 8300.00, 0.00, 8300.00, 'unpaid', 9),
(5, 'BILL-0005', 4, 4, 5000.00, 150.00, 4850.00, 'paid', 10);

INSERT INTO bill_items (bill_id, description, category, quantity, unit_price, total) VALUES
(1, 'General consultation', 'consultation', 1, 5000.00, 5000.00),
(2, 'Cardiology consultation', 'consultation', 1, 5000.00, 5000.00),
(2, 'Lipid Profile test', 'lab', 1, 5500.00, 5500.00),
(3, 'General consultation', 'consultation', 1, 5000.00, 5000.00),
(3, 'Lisinopril 10mg (30 tablets)', 'pharmacy', 30, 65.00, 1950.00),
(3, 'Miscellaneous fee', 'other', 1, 550.00, 550.00),
(4, 'Cardiology consultation', 'consultation', 1, 5000.00, 5000.00),
(4, 'Kidney Function Test', 'lab', 1, 3300.00, 3300.00),
(5, 'General consultation', 'consultation', 1, 5000.00, 5000.00);

INSERT INTO payments (bill_id, amount, payment_method, payment_date, received_by, notes) VALUES
(1, 5000.00, 'cash', '2026-07-10', 9, 'Paid in full at reception'),
(2, 10000.00, 'card', '2026-07-10', 9, 'Paid via POS'),
(3, 4000.00, 'transfer', '2026-07-16', 9, 'Partial payment received'),
(5, 4850.00, 'cash', '2026-07-12', 10, 'Paid in full at reception');

-- ------------------------------------------------------------
-- AUDIT LOG (sample entries)
-- ------------------------------------------------------------
INSERT INTO audit_log (user_id, action, module, record_id, ip_address) VALUES
(1, 'CREATE_USER', 'users', 2, '127.0.0.1'),
(9, 'REGISTER_PATIENT', 'patients', 1, '127.0.0.1'),
(9, 'CREATE_APPOINTMENT', 'appointments', 1, '127.0.0.1'),
(9, 'CREATE_BILL', 'billing', 1, '127.0.0.1'),
(1, 'LOGIN', 'auth', NULL, '127.0.0.1');

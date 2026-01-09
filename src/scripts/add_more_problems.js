require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Problem = require('../models/Problem');

async function addMoreProblems() {
  try {
    await connectDB(process.env.MONGO_URI);
    console.log('🚀 Connected to database...');

    const newProblems = [
      // --- PHYSICS (10) ---
      {
        title: 'Projectile Motion - Maximum Height',
        statement: 'A ball is thrown with an initial velocity of 20 m/s at an angle of 30° to the horizontal. What is the maximum height reached by the ball? (g = 10 m/s²)',
        subject: 'Physics',
        topics: ['Mechanics', 'Kinematics'],
        difficulty: 'easy',
        inputType: 'mcq_single',
        options: [
          { id: 'A', text: '5 m' },
          { id: 'B', text: '10 m' },
          { id: 'C', text: '15 m' },
          { id: 'D', text: '20 m' }
        ],
        correctAnswer: 'A',
        points: 2,
        solution: 'H = (u² sin²θ) / 2g = (20² * sin²30°) / (2 * 10) = (400 * 0.25) / 20 = 100 / 20 = 5 m.'
      },
      {
        title: 'Circular Motion - Centripetal Force',
        statement: 'A car of mass 1000 kg moves in a circular path of radius 50 m with a speed of 10 m/s. What is the centripetal force acting on the car?',
        subject: 'Physics',
        topics: ['Mechanics', 'Circular Motion'],
        difficulty: 'easy',
        inputType: 'mcq_single',
        options: [
          { id: 'A', text: '1000 N' },
          { id: 'B', text: '2000 N' },
          { id: 'C', text: '500 N' },
          { id: 'D', text: '4000 N' }
        ],
        correctAnswer: 'B',
        points: 2,
        solution: 'F = mv²/r = (1000 * 10²) / 50 = (1000 * 100) / 50 = 2000 N.'
      },
      {
        title: 'Thermodynamics - First Law',
        statement: 'In a thermodynamic process, 500 J of heat is added to a system and the system does 200 J of work. What is the change in internal energy?',
        subject: 'Physics',
        topics: ['Thermodynamics'],
        difficulty: 'easy',
        inputType: 'mcq_single',
        options: [
          { id: 'A', text: '700 J' },
          { id: 'B', text: '300 J' },
          { id: 'C', text: '-300 J' },
          { id: 'D', text: '500 J' }
        ],
        correctAnswer: 'B',
        points: 2,
        solution: 'ΔU = Q - W = 500 - 200 = 300 J.'
      },
      {
        title: 'Electrostatics - Coulomb\'s Law',
        statement: 'Two point charges of +2μC and +6μC are separated by a distance r. If the force between them is F, what will be the force if the distance is doubled?',
        subject: 'Physics',
        topics: ['Electrostatics'],
        difficulty: 'medium',
        inputType: 'mcq_single',
        options: [
          { id: 'A', text: 'F/2' },
          { id: 'B', text: 'F/4' },
          { id: 'C', text: '2F' },
          { id: 'D', text: '4F' }
        ],
        correctAnswer: 'B',
        points: 3,
        solution: 'F ∝ 1/r². If r becomes 2r, F becomes F/4.'
      },
      {
        title: 'Optics - Snell\'s Law',
        statement: 'A ray of light enters from air (n=1) into glass (n=1.5) at an angle of incidence of 45°. What is the sine of the angle of refraction?',
        subject: 'Physics',
        topics: ['Optics'],
        difficulty: 'medium',
        inputType: 'mcq_single',
        options: [
          { id: 'A', text: '1/√2' },
          { id: 'B', text: '1/(1.5√2)' },
          { id: 'C', text: '1.5/√2' },
          { id: 'D', text: '√2/1.5' }
        ],
        correctAnswer: 'B',
        points: 3,
        solution: 'n1 sinθ1 = n2 sinθ2 => 1 * sin45° = 1.5 * sinθ2 => sinθ2 = (1/√2) / 1.5 = 1 / (1.5√2).'
      },
      {
        title: 'Modern Physics - Photoelectric Effect',
        statement: 'The work function of a metal is 2.0 eV. If light of frequency such that hf = 3.5 eV falls on it, what is the maximum kinetic energy of the emitted photoelectrons?',
        subject: 'Physics',
        topics: ['Modern Physics'],
        difficulty: 'easy',
        inputType: 'mcq_single',
        options: [
          { id: 'A', text: '1.5 eV' },
          { id: 'B', text: '5.5 eV' },
          { id: 'C', text: '2.0 eV' },
          { id: 'D', text: '3.5 eV' }
        ],
        correctAnswer: 'A',
        points: 2,
        solution: 'K_max = hf - Φ = 3.5 - 2.0 = 1.5 eV.'
      },
      {
        title: 'Waves - Doppler Effect',
        statement: 'A source of sound moves towards a stationary observer. The observed frequency will be:',
        subject: 'Physics',
        topics: ['Waves'],
        difficulty: 'easy',
        inputType: 'mcq_single',
        options: [
          { id: 'A', text: 'Higher than the source frequency' },
          { id: 'B', text: 'Lower than the source frequency' },
          { id: 'C', text: 'Same as the source frequency' },
          { id: 'D', text: 'Zero' }
        ],
        correctAnswer: 'A',
        points: 2,
        solution: 'When the source moves towards the observer, the waves are compressed, leading to a higher observed frequency.'
      },
      {
        title: 'Magnetism - Magnetic Force',
        statement: 'A proton enters a uniform magnetic field B perpendicular to its velocity v. The path of the proton will be:',
        subject: 'Physics',
        topics: ['Magnetism'],
        difficulty: 'easy',
        inputType: 'mcq_single',
        options: [
          { id: 'A', text: 'Straight line' },
          { id: 'B', text: 'Parabola' },
          { id: 'C', text: 'Circle' },
          { id: 'D', text: 'Helix' }
        ],
        correctAnswer: 'C',
        points: 2,
        solution: 'A charge moving perpendicular to a uniform magnetic field experiences a constant force perpendicular to its velocity, resulting in circular motion.'
      },
      {
        title: 'Work, Energy, Power - Conservation',
        statement: 'A block of mass 2 kg is dropped from a height of 10 m. What is its kinetic energy just before hitting the ground? (g = 10 m/s²)',
        subject: 'Physics',
        topics: ['Mechanics', 'Work-Energy'],
        difficulty: 'easy',
        inputType: 'mcq_single',
        options: [
          { id: 'A', text: '100 J' },
          { id: 'B', text: '200 J' },
          { id: 'C', text: '50 J' },
          { id: 'D', text: '400 J' }
        ],
        correctAnswer: 'B',
        points: 2,
        solution: 'KE = PE_initial = mgh = 2 * 10 * 10 = 200 J.'
      },
      {
        title: 'Current Electricity - Ohm\'s Law',
        statement: 'Three resistors of 2Ω, 4Ω, and 6Ω are connected in series to a 24V battery. What is the current in the circuit?',
        subject: 'Physics',
        topics: ['Current Electricity'],
        difficulty: 'easy',
        inputType: 'mcq_single',
        options: [
          { id: 'A', text: '1 A' },
          { id: 'B', text: '2 A' },
          { id: 'C', text: '4 A' },
          { id: 'D', text: '12 A' }
        ],
        correctAnswer: 'B',
        points: 2,
        solution: 'R_eq = 2 + 4 + 6 = 12Ω. I = V/R = 24/12 = 2 A.'
      },

      // --- CHEMISTRY (10) ---
      {
        title: 'Atomic Structure - Quantum Numbers',
        statement: 'Which quantum number determines the orientation of an orbital in space?',
        subject: 'Chemistry',
        topics: ['Atomic Structure'],
        difficulty: 'easy',
        inputType: 'mcq_single',
        options: [
          { id: 'A', text: 'Principal quantum number (n)' },
          { id: 'B', text: 'Azimuthal quantum number (l)' },
          { id: 'C', text: 'Magnetic quantum number (ml)' },
          { id: 'D', text: 'Spin quantum number (ms)' }
        ],
        correctAnswer: 'C',
        points: 2,
        solution: 'The magnetic quantum number (ml) describes the orientation of the orbital.'
      },
      {
        title: 'Chemical Bonding - VSEPR Theory',
        statement: 'What is the shape of a CH4 molecule according to VSEPR theory?',
        subject: 'Chemistry',
        topics: ['Chemical Bonding'],
        difficulty: 'easy',
        inputType: 'mcq_single',
        options: [
          { id: 'A', text: 'Linear' },
          { id: 'B', text: 'Trigonal Planar' },
          { id: 'C', text: 'Tetrahedral' },
          { id: 'D', text: 'Octahedral' }
        ],
        correctAnswer: 'C',
        points: 2,
        solution: 'CH4 has 4 bond pairs and 0 lone pairs, resulting in a tetrahedral shape.'
      },
      {
        title: 'Periodic Table - Electronegativity',
        statement: 'Which element has the highest electronegativity in the periodic table?',
        subject: 'Chemistry',
        topics: ['Periodic Classification'],
        difficulty: 'easy',
        inputType: 'mcq_single',
        options: [
          { id: 'A', text: 'Oxygen' },
          { id: 'B', text: 'Chlorine' },
          { id: 'C', text: 'Fluorine' },
          { id: 'D', text: 'Nitrogen' }
        ],
        correctAnswer: 'C',
        points: 2,
        solution: 'Fluorine is the most electronegative element.'
      },
      {
        title: 'Thermodynamics - Entropy',
        statement: 'For a spontaneous process at constant temperature and pressure, which of the following must be true?',
        subject: 'Chemistry',
        topics: ['Thermodynamics'],
        difficulty: 'medium',
        inputType: 'mcq_single',
        options: [
          { id: 'A', text: 'ΔH < 0' },
          { id: 'B', text: 'ΔS > 0' },
          { id: 'C', text: 'ΔG < 0' },
          { id: 'D', text: 'ΔG > 0' }
        ],
        correctAnswer: 'C',
        points: 3,
        solution: 'Spontaneity is determined by the Gibbs Free Energy change (ΔG < 0).'
      },
      {
        title: 'Equilibrium - Le Chatelier\'s Principle',
        statement: 'In the exothermic reaction N2 + 3H2 ⇌ 2NH3, increasing the temperature will:',
        subject: 'Chemistry',
        topics: ['Chemical Equilibrium'],
        difficulty: 'medium',
        inputType: 'mcq_single',
        options: [
          { id: 'A', text: 'Shift equilibrium to the right' },
          { id: 'B', text: 'Shift equilibrium to the left' },
          { id: 'C', text: 'Have no effect' },
          { id: 'D', text: 'Increase the yield of NH3' }
        ],
        correctAnswer: 'B',
        points: 3,
        solution: 'For an exothermic reaction, increasing temperature shifts equilibrium towards the reactants (left).'
      },
      {
        title: 'Organic Chemistry - Hybridization',
        statement: 'What is the hybridization of carbon in ethyne (C2H2)?',
        subject: 'Chemistry',
        topics: ['Organic Chemistry'],
        difficulty: 'easy',
        inputType: 'mcq_single',
        options: [
          { id: 'A', text: 'sp' },
          { id: 'B', text: 'sp2' },
          { id: 'C', text: 'sp3' },
          { id: 'D', text: 'dsp2' }
        ],
        correctAnswer: 'A',
        points: 2,
        solution: 'In ethyne, each carbon is triple-bonded to another carbon, resulting in sp hybridization.'
      },
      {
        title: 'Solutions - Raoult\'s Law',
        statement: 'An ideal solution is one which obeys Raoult\'s law over:',
        subject: 'Chemistry',
        topics: ['Solutions'],
        difficulty: 'easy',
        inputType: 'mcq_single',
        options: [
          { id: 'A', text: 'Low concentrations only' },
          { id: 'B', text: 'High concentrations only' },
          { id: 'C', text: 'The entire range of concentration' },
          { id: 'D', text: 'Specific temperatures only' }
        ],
        correctAnswer: 'C',
        points: 2,
        solution: 'Ideal solutions obey Raoult\'s law at all concentrations and temperatures.'
      },
      {
        title: 'Electrochemistry - Faraday\'s Law',
        statement: 'The amount of substance deposited during electrolysis is proportional to:',
        subject: 'Chemistry',
        topics: ['Electrochemistry'],
        difficulty: 'easy',
        inputType: 'mcq_single',
        options: [
          { id: 'A', text: 'Voltage' },
          { id: 'B', text: 'Resistance' },
          { id: 'C', text: 'Quantity of electricity passed' },
          { id: 'D', text: 'Time only' }
        ],
        correctAnswer: 'C',
        points: 2,
        solution: 'Faraday\'s First Law states m ∝ Q (where Q = It).'
      },
      {
        title: 'Kinetics - Order of Reaction',
        statement: 'If the rate of reaction doubles when the concentration of a reactant is doubled, the order of reaction with respect to that reactant is:',
        subject: 'Chemistry',
        topics: ['Chemical Kinetics'],
        difficulty: 'easy',
        inputType: 'mcq_single',
        options: [
          { id: 'A', text: '0' },
          { id: 'B', text: '1' },
          { id: 'C', text: '2' },
          { id: 'D', text: '0.5' }
        ],
        correctAnswer: 'B',
        points: 2,
        solution: 'Rate ∝ [A]^n. If 2*Rate ∝ [2A]^n, then n = 1.'
      },
      {
        title: 'Coordination Compounds - IUPAC',
        statement: 'What is the oxidation state of Fe in [Fe(CN)6]4-?',
        subject: 'Chemistry',
        topics: ['Coordination Compounds'],
        difficulty: 'medium',
        inputType: 'mcq_single',
        options: [
          { id: 'A', text: '+2' },
          { id: 'B', text: '+3' },
          { id: 'C', text: '+4' },
          { id: 'D', text: '0' }
        ],
        correctAnswer: 'A',
        points: 3,
        solution: 'x + 6(-1) = -4 => x = +2.'
      },

      // --- MATHS (10) ---
      {
        title: 'Calculus - Differentiation',
        statement: 'What is the derivative of sin(x²) with respect to x?',
        subject: 'Maths',
        topics: ['Calculus', 'Differentiation'],
        difficulty: 'easy',
        inputType: 'mcq_single',
        options: [
          { id: 'A', text: 'cos(x²)' },
          { id: 'B', text: '2x cos(x²)' },
          { id: 'C', text: '-2x cos(x²)' },
          { id: 'D', text: '2x sin(x²)' }
        ],
        correctAnswer: 'B',
        points: 2,
        solution: 'Using chain rule: d/dx(sin(x²)) = cos(x²) * d/dx(x²) = 2x cos(x²).'
      },
      {
        title: 'Calculus - Integration',
        statement: 'Evaluate ∫ (1/x) dx from 1 to e.',
        subject: 'Maths',
        topics: ['Calculus', 'Integration'],
        difficulty: 'easy',
        inputType: 'mcq_single',
        options: [
          { id: 'A', text: '0' },
          { id: 'B', text: '1' },
          { id: 'C', text: 'e' },
          { id: 'D', text: 'ln(e) - 1' }
        ],
        correctAnswer: 'B',
        points: 2,
        solution: '∫ (1/x) dx = [ln|x|] from 1 to e = ln(e) - ln(1) = 1 - 0 = 1.'
      },
      {
        title: 'Algebra - Quadratic Equations',
        statement: 'If α and β are the roots of x² - 5x + 6 = 0, find α + β.',
        subject: 'Maths',
        topics: ['Algebra'],
        difficulty: 'easy',
        inputType: 'mcq_single',
        options: [
          { id: 'A', text: '5' },
          { id: 'B', text: '-5' },
          { id: 'C', text: '6' },
          { id: 'D', text: '-6' }
        ],
        correctAnswer: 'A',
        points: 2,
        solution: 'Sum of roots = -b/a = -(-5)/1 = 5.'
      },
      {
        title: 'Trigonometry - Identities',
        statement: 'What is the value of sin(75°)?',
        subject: 'Maths',
        topics: ['Trigonometry'],
        difficulty: 'medium',
        inputType: 'mcq_single',
        options: [
          { id: 'A', text: '(√3 + 1) / 2√2' },
          { id: 'B', text: '(√3 - 1) / 2√2' },
          { id: 'C', text: '1/2' },
          { id: 'D', text: '√3/2' }
        ],
        correctAnswer: 'A',
        points: 3,
        solution: 'sin(45+30) = sin45 cos30 + cos45 sin30 = (1/√2)(√3/2) + (1/√2)(1/2) = (√3 + 1) / 2√2.'
      },
      {
        title: 'Coordinate Geometry - Straight Lines',
        statement: 'What is the slope of the line 3x + 4y = 12?',
        subject: 'Maths',
        topics: ['Coordinate Geometry'],
        difficulty: 'easy',
        inputType: 'mcq_single',
        options: [
          { id: 'A', text: '3/4' },
          { id: 'B', text: '-3/4' },
          { id: 'C', text: '4/3' },
          { id: 'D', text: '-4/3' }
        ],
        correctAnswer: 'B',
        points: 2,
        solution: '4y = -3x + 12 => y = (-3/4)x + 3. Slope m = -3/4.'
      },
      {
        title: 'Probability - Dice',
        statement: 'What is the probability of getting a sum of 7 when two fair dice are rolled?',
        subject: 'Maths',
        topics: ['Probability'],
        difficulty: 'easy',
        inputType: 'mcq_single',
        options: [
          { id: 'A', text: '1/6' },
          { id: 'B', text: '1/12' },
          { id: 'C', text: '5/36' },
          { id: 'D', text: '1/4' }
        ],
        correctAnswer: 'A',
        points: 2,
        solution: 'Total outcomes = 36. Favorable: (1,6), (2,5), (3,4), (4,3), (5,2), (6,1) = 6. P = 6/36 = 1/6.'
      },
      {
        title: 'Matrices - Determinants',
        statement: 'If the determinant of a 2x2 matrix [[a, b], [c, d]] is 0, then the matrix is:',
        subject: 'Maths',
        topics: ['Algebra', 'Matrices'],
        difficulty: 'easy',
        inputType: 'mcq_single',
        options: [
          { id: 'A', text: 'Identity' },
          { id: 'B', text: 'Singular' },
          { id: 'C', text: 'Invertible' },
          { id: 'D', text: 'Orthogonal' }
        ],
        correctAnswer: 'B',
        points: 2,
        solution: 'A matrix with determinant zero is called a singular matrix.'
      },
      {
        title: 'Vectors - Dot Product',
        statement: 'If vectors A and B are perpendicular, their dot product A·B is:',
        subject: 'Maths',
        topics: ['Vectors'],
        difficulty: 'easy',
        inputType: 'mcq_single',
        options: [
          { id: 'A', text: '1' },
          { id: 'B', text: '0' },
          { id: 'C', text: '-1' },
          { id: 'D', text: '|A||B|' }
        ],
        correctAnswer: 'B',
        points: 2,
        solution: 'A·B = |A||B| cosθ. If θ=90°, cos90°=0, so A·B=0.'
      },
      {
        title: 'Complex Numbers - Modulus',
        statement: 'What is the modulus of the complex number 3 + 4i?',
        subject: 'Maths',
        topics: ['Algebra', 'Complex Numbers'],
        difficulty: 'easy',
        inputType: 'mcq_single',
        options: [
          { id: 'A', text: '5' },
          { id: 'B', text: '7' },
          { id: 'C', text: '25' },
          { id: 'D', text: '√7' }
        ],
        correctAnswer: 'A',
        points: 2,
        solution: '|z| = √(3² + 4²) = √(9 + 16) = √25 = 5.'
      },
      {
        title: 'Statistics - Mean',
        statement: 'The mean of 5 numbers is 10. If one number is removed, the mean becomes 9. What was the removed number?',
        subject: 'Maths',
        topics: ['Statistics'],
        difficulty: 'medium',
        inputType: 'mcq_single',
        options: [
          { id: 'A', text: '10' },
          { id: 'B', text: '14' },
          { id: 'C', text: '11' },
          { id: 'D', text: '15' }
        ],
        correctAnswer: 'B',
        points: 3,
        solution: 'Sum of 5 = 5 * 10 = 50. Sum of 4 = 4 * 9 = 36. Removed = 50 - 36 = 14.'
      }
    ];

    const inserted = await Problem.insertMany(newProblems);
    console.log(`✅ Successfully added ${inserted.length} new MCQ problems!`);
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding problems:', err);
    process.exit(1);
  }
}

addMoreProblems();

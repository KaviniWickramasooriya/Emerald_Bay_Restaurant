const router = require("express").Router();
const authMiddleware = require("../middleware/authMiddleware");
const bcrypt = require("bcrypt");
const Customer = require("../models/Customer");
const TableReservation = require("../models/TableReservation");
const VIPRoomReservation = require("../models/VIPRoomReservation");
const Event = require("../models/Event");
const sendEmail = require("../util/sendEmail");
const customerRegistrationEmailTemplate = require("../util/email_templates/customerRegistrationEmailTemplate");


//add student
router.route("/add").post(async (req,res)=>{
    //create a new student object with the data from the request body

    
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    const status = req.body.status;
    const address = req.body.address;

    //convert request to a number 
    const mobile = Number(req.body.mobile);
    const hashedPassword = await bcrypt.hash(password, 10);
    const newCustomer = new Customer({
        
        name,
        email,
        mobile,
        password:hashedPassword,
        status,
        address,
    });

    newCustomer.save()
    //if insert success  //js promise
        .then(()=>{
            res.json("Customer Added ");
            // Send confirmation email to the customer
      const emailTemplate = customerRegistrationEmailTemplate(name, email, mobile, password, address);
      sendEmail(email, "Registration Confirmation", emailTemplate);
        })
        //if unsucces
        .catch((err)=>{
            console.log(err);
        })
});




  //get students
router.route("/").get((req, res) => {
  //return all students in the database
  Customer.find()
  .then((customers)=>{
      res.json(customers);
  })
  .catch((err)=>{
      console.log(err);
  })
})


//update student
/*
router.route("/update/:id").put(async (req,res)=>{
  
  let stdId = req.params.id;
  
  //dstructure
  const {userId,name,email,mobile} = req.body;

  const updateStudent = {
      userId,
      name,
      email,
      mobile
  }

  const update = await Student.findByIdAndUpdate(stdId, updateStudent)
  .then(()=>{
      res.status(200).send({status: "User updated", user: update });
  })
  .catch((err)=>{
      console.log(err);
      res.status(500).send({status:"Error with updating data"});
  })


  
})*/

// update student
router.route("/update/:_id").put(async (req, res) => {
  let _id = req.params._id;

  // destructure the request body
  const { name, email, mobile, address, password } = req.body;

  const updateCustomer = {
      name,
      email,
      mobile,
      address,
      password,
  };

  try {
      const updatedCustomer = await Customer.findOneAndUpdate({ _id }, updateCustomer, { new: true });

      if (!updatedCustomer) {
          return res.status(404).send({ status: "Customer not found" });
      }

      res.status(200).send({ status: "Customer updated", user: updatedCustomer });
  } catch (err) {
      console.log(err);
      res.status(500).send({ status: "Error with updating data" });
  }
});


//delete cus
router.route("/delete/:_id").delete(async (req,res)=>{
  let _id=req.params._id;
  
  await Customer.findOneAndDelete({_id:_id})
  .then(()=>{
      res.status(200).send({status:"User deleted"})
  })
  .catch((err)=>{
      console.log(err.message);
      res.status(500).send({status:"Error with delete student", error : err.message});
  })


})


//fetch data from one student
/*
router.route("/get/:userId").get(async (req,res)=>{

  let userId = req.params.userId;

  const user = await Student.findOne({userId:userId})
  .then(()=>{
      res.status(200).send({status: "Student fetched ", user: user })
  })
  .catch((err)=>{
      console.log(err.message);
      res.status(500).send({status:"Error with get student ", error : err.message});   
   })
})*/

// fetch data from one student
router.route("/get/:_id").get(async (req, res) => {
  let _id = req.params._id;

  try {
      const user = await Customer.findOne({ _id: _id });

      if (!user) {
          return res.status(404).send({ status: "Customer not found" });
      }

      res.status(200).send({ status: "Customer fetched", user: user });
  } catch (err) {
      console.log(err.message);
      res.status(500).send({ status: "Error with getting customer", error: err.message });
  }
});

// Fetch table reservations by customer email
router.get("/tableReservations/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const customer = await Customer.findOne({ email });

    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    const tableReservations = await TableReservation.find({ email: customer.email });
    res.json(tableReservations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error retrieving table reservations" });
  }
});

// Fetch VIP room reservations by customer email
router.get("/vipRoomReservations/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const customer = await Customer.findOne({ email });

    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    const vipRoomReservations = await VIPRoomReservation.find({ email: customer.email });
    res.json(vipRoomReservations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error retrieving VIP room reservations" });
  }
});

// Fetch events by customer email
router.get("/events/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const customer = await Customer.findOne({ email });

    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    const events = await Event.find({ email: customer.email });
    res.json(events);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error retrieving events" });
  }
});

module.exports = router;
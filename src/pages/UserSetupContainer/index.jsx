import { useState } from "react";
import { Button, Container, Form, Stack } from "react-bootstrap";
import { useDispatch } from "react-redux";
import { setUserDetails } from "../../features/userDetails/userDetailsSlice";

function UserSetupContainer({headerHeight}) {
  const storeDispatch = useDispatch();

  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const bodyHeight = 100-headerHeight;

  const handleFormSubmit = (event) =>{
    event.preventDefault();
    event.stopPropagation();
    const form = event.currentTarget;
    if (form.checkValidity()) {
      storeDispatch(setUserDetails(firstName, lastName, username));
    }
    
  }
  return (
    <>
      <Container fluid style={{height:bodyHeight+"vh"}} className="py-1">
        <Stack className="justify-content-center h-100">
          <Container  fluid className={`h-50 bg-body-secondary bg-opacity-50 app-card rounded-4`} style={{width: '35%'}}>
            <Stack className="justify-content-between h-100">
              <Stack className="mb-4">
                <span className='fs-2'>Hey There!</span>
                <span>Tell us a little about yourself</span>
                <hr />
              </Stack>
              <Form onSubmit={handleFormSubmit}>
                <Stack gap={3}>
                  <Form.Control
                    value={username}
                    onChange={(e)=>{setUsername(e.target.value)}}
                    placeholder="Username"
                    required
                    size="lg"
                  />
                  <Form.Control
                    value={firstName}
                    onChange={(e)=>{setFirstName(e.target.value)}}
                    placeholder="First name"
                    required
                    size="lg"
                  />

                  <Form.Control
                    value={lastName}
                    onChange={(e)=>{setLastName(e.target.value)}}
                    placeholder="Last name"
                    required
                    size="lg"
                  />

                  <Button 
                    variant={`warning`} 
                    className={`w-100 rounded-4`} 
                    size="lg"
                    type="submit">
                      Next Step 🚀
                  </Button>
                  
                </Stack>
              </Form>
            </Stack>
          </Container>
        </Stack>
      </Container>
    </>
  );
}

export default UserSetupContainer;

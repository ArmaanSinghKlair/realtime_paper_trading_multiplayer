import React, { useState } from "react";
import { Button, Container, Form, InputGroup, Nav, Row, Stack, Tab } from "react-bootstrap";
import TooltipText from "../../components/common/TooltipText";
import { InfoCircleFill } from "react-bootstrap-icons";
import { useDispatch } from "react-redux";
import { setTradingRoomId } from "../../features/userDetails/userDetailsSlice";
import { v4 as uuidv4 } from 'uuid';

const TradingRoomSetupContainer = ({headerHeight}) => {
    const [existingRoomId, setExistingRoomId] = useState('');
    const storeDispatch = useDispatch();

    const bodyHeight = 100-headerHeight;

    /**
     * Sets the trading room ID to provided ID.
     * @param {*} event Form submit event.
     */
    const handleJoinExistingRoomSubmit = (event) =>{
        event.preventDefault();
        event.stopPropagation();
        const form = event.currentTarget;
        if (form.checkValidity()) {
          storeDispatch(setTradingRoomId(existingRoomId));
        } 
      }

      /**
       * Creates new trading room with random ID
       */
      const createNewRoomHandler = () =>{
        storeDispatch(setTradingRoomId(uuidv4()))
      }
    return (
        <>
            <Container fluid style={{height:bodyHeight+"vh"}} className="py-1">
            <Stack className="justify-content-center h-100">
                <Container  fluid className={`h-50 bg-body-secondary bg-opacity-50 app-card rounded-4`} style={{width: '35%'}}>
                <Stack className="h-100">
                    <Stack>
                        <span className='fs-2'>Almost There!</span>
                        <span>Setup trading environment</span>
                        <hr />
                    </Stack>
                    <Stack>
                    <Button 
                    variant={`warning`} 
                    className={`w-100 rounded-4`} 
                    size="lg"
                    type="submit"
                    onClick={createNewRoomHandler}
                    >
                        Create New Room 🚀
                    </Button>
                    <Stack className="align-items-center justify-content-center">OR</Stack>
                    <Form onSubmit={handleJoinExistingRoomSubmit}>
                        <Stack gap={3}>
                            <InputGroup>
                                <Form.Control
                                value={existingRoomId}
                                onChange={(e)=>{setExistingRoomId(e.target.value)}}
                                placeholder="Enter Room Id here"
                                required
                                size="lg"
                                />
                                <InputGroup.Text>
                                    <TooltipText title={'Ask your friend for this ID. Its available on top of the trading page.'}><InfoCircleFill /></TooltipText>
                                </InputGroup.Text>
                            </InputGroup>

                            <Button 
                            variant={`warning`} 
                            className={`w-100 rounded-4`} 
                            size="lg"
                            type="submit">
                                Join Room 🚀
                            </Button> 
                        </Stack>
                    </Form>
                    </Stack>
                </Stack>
                </Container>
            </Stack>
            </Container>
        </>
        );
};

export default TradingRoomSetupContainer;

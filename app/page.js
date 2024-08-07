'use client'
import Image from "next/image";
import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded';
import React, { useMemo, useState } from 'react';
import { Box, Button, Stack, sendMessage, Switch, TextField, Typography } from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';


export default function Home() {
  /* ----- SET LIGHT/DARK MODE ----- */
  const [darkMode, setDarkMode] = useState(useMediaQuery('(prefers-color-scheme: dark)'));

  const theme = React.useMemo (() =>
      createTheme ({
        palette: {
          mode: darkMode ? 'dark' : 'light',
        },
      }),
    [darkMode],
  );

  const handleToggleDarkMode = () => {
    setDarkMode(!darkMode);
  }
  /* ----- END | SET LIGHT/DARK MODE ----- */


  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hi! I'm the Headstarter Support Agent, how can I assist you today?`
    }
  ]);

  const [message, setMessage] = useState('');

  const sendMessage = async () => {
    
    setMessages((messages) => [
      ...messages,
      { role: "user", content: message },
      { role: "assistant", content: '' }
    ]);

    setMessage('');

    const response = await fetch('/api/customer', {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify([...messages, { role: 'user', content: message }])
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    let result = '';
    reader.read().then(function processText({ done, value }) {
      if (done) {
        return result;
      }
      const text = decoder.decode(value || new IntBArray(), { stream: true });
      setMessages((messages) => {
        let lastMessage = messages[messages.length - 1];
        let otherMessages = messages.slice(0, messages.length - 1);
        return [
          ...otherMessages,
          {
            ...lastMessage,
            content: lastMessage.content + text
          }
        ];
      });
      return reader.read().then(processText); 
    });
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box pwidth="100vw" height="100vh" display="flex" flexDirection="column" justifyContent="center" alignItems="center" overflow="hidden">
        
        {/* ----- MAIN CONTAINER ----- */}
        <Stack
          position="absolute"
          top="50%"
          left="50%"
          sx={{
            transform: 'translate(-50%, -50%)'
          }}
          direction="column"
          width="100%"
          height="100%"
          spacing={3}
        >

          {/* ----- CHAT HEADER ----- */}
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            fullWidth
            borderBottom="3px solid black"
            bgcolor="blue"
          >
            <Typography variant="h3">AI Chat Bot</Typography>
            <Button onClick={handleToggleDarkMode}>
              {darkMode ? 'Light Mode' : 'Dark Mode'}
            </Button>
          </Box>


          {/* ----- MESSAGE DISPLAY CONTAINER ----- */}
          <Stack
            direction='column'
            spacing={2}
            flexGrow={1}
            overflow='auto'
            maxHeight='100%'
          >
            {
              messages.map((message, index) => (
                <Box 
                  key={index} 
                  display='flex' 
                  justifyContent={message.role === 'assistant' ? 'flex-start' : 'flex-end'}
                >
                  <Box
                    bgcolor={
                      message.role === 'assistant' ? 'primary.main' : 'secondary.main'
                    }
                    color="white"
                    borderRadius={16}
                    padding={2}
                  >
                    {message.content}
                  </Box>
                </Box>
              ))}
          </Stack>

          {/* ----- MESSAGE INPUT CONTAINER ------*/}
          <Stack
            direction="row"
            spacing={2}
            sx={{
              padding: '0px 15px 10px 15px',
            }}
          >
            <TextField
              label="Enter your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              fullWidth
              InputProps={{
                style: {
                  borderRadius: "30px",
                }
              }}
            />
            <Button
              variant="contained"
              onClick={sendMessage}
              sx={{
                borderRadius: "50%",
              }}
            ><ArrowUpwardRoundedIcon /></Button>

          </Stack> {/* ----- END | MESSAGE INPUT CONTAINER ----- */}
        </Stack> {/* ----- END | MAIN CONTAINER ----- */}
      </Box>
    </ThemeProvider>
  );
}

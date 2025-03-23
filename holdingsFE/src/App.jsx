import { useState, useEffect, useRef } from "react";
import {
  Container,
  Paper,
  TextField,
  Button,
  List,
  ListItem,
  Typography,
  AppBar,
  Toolbar,
  Chip,
} from "@mui/material";

const FLASK_API_URL = import.meta.env.VITE_FLASK_API_URL;

const ChatApp = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const keywordSuggestions = ["채용일정", "포트폴리오", "인재상", "면접", "이력서", "자소서"];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const sendMessage = async (message) => {
    if (!message.trim() || isLoading) return;

    const newMessages = [...messages, { text: message, sender: "user" }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const response = await fetch(FLASK_API_URL, {
        method: "POST",
        mode: "cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      const data = await response.json();
      const assistantReply = data?.reply || "(오류 발생)";

      setMessages([...newMessages, { text: assistantReply, sender: "assistant" }]);
    } catch (error) {
      console.error("Flask API Error:", error);
      setMessages([...newMessages, { text: "(서버 오류 발생)", sender: "assistant" }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = () => {
    const message = input;
    setInput("");
    sendMessage(message);
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Container
      maxWidth="sm"
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        paddingTop: "4.5rem",
        paddingBottom: "6rem",
      }}
    >
      {/* 상단바 */}
      <AppBar
        position="fixed"
        style={{
          top: 0,
          backgroundColor: "#002B68",
          zIndex: 1100,
        }}
      >
        <Toolbar style={{ justifyContent: "center", gap: "8px" }}>
          <img
            src="/hlholdingswhite.png"
            alt="HL Holdings Logo"
            style={{ height: "32px", width: "auto" }}
          />
          <Typography variant="h5" style={{ color: "#00B4ED", fontWeight: "bold" }}>
            Hire Bot
          </Typography>
        </Toolbar>
      </AppBar>

      {/* 채팅 영역 */}
      <Paper
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "1rem",
          backgroundColor: "#FFFFFF",
        }}
      >
        <List>
          {/* 키워드 추천 */}
          {messages.length === 0 && (
            <ListItem style={{ flexDirection: "column", alignItems: "center" }}>
              <Typography variant="body1" style={{ marginBottom: "8px", color: "gray" }}>
                원하는 키워드를 선택하거나 직접 입력하세요.
              </Typography>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "center" }}>
                {keywordSuggestions.map((keyword) => (
                  <Chip
                    key={keyword}
                    label={keyword}
                    onClick={() => {
                      setInput("");
                      sendMessage(keyword);
                    }}
                    style={{
                      backgroundColor: "#002B68",
                      color: "white",
                      fontWeight: "bold",
                      cursor: "pointer",
                    }}
                  />
                ))}
              </div>
            </ListItem>
          )}

          {/* 메시지 목록 */}
          {messages.map((msg, index) => (
            <ListItem
              key={index}
              style={{
                display: "flex",
                justifyContent: msg.sender === "user" ? "flex-end" : "flex-start",
              }}
            >
              <Paper
                style={{
                  padding: "0.8rem 1rem",
                  backgroundColor: msg.sender === "user" ? "#00B4ED" : "rgb(248 250 252)",
                  color: msg.sender === "user" ? "white" : "black",
                  width: "fit-content",
                  minWidth: "180px",       // ✅ 고정 너비
                  maxWidth: "70%",
                  wordBreak: "break-word",
                  borderRadius: "12px",
                }}
              >
                <Typography variant="body1">{msg.text}</Typography>
              </Paper>
            </ListItem>
          ))}

          {/* 로딩 중 */}
          {isLoading && (
            <ListItem style={{ justifyContent: "flex-start" }}>
              <Paper
                style={{
                  padding: "0.8rem 1rem",
                  backgroundColor: "rgb(248 250 252)",
                  color: "black",
                  width: "fit-content",
                  minWidth: "180px",
                  maxWidth: "70%",
                  borderRadius: "12px",
                  textAlign: "center",
                }}
              >
                <Typography variant="body1">...</Typography>
              </Paper>
            </ListItem>
          )}

          {/* 스크롤 고정용 */}
          <div ref={messagesEndRef} />
        </List>
      </Paper>

      {/* 입력창 고정 */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          padding: "1rem",
          backgroundColor: "white",
          display: "flex",
          justifyContent: "center",
          borderTop: "1px solid #eee",
          zIndex: 1000,
        }}
      >
        <div style={{ display: "flex", width: "100%", maxWidth: "500px" }}>
          <TextField
            fullWidth
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="메시지를 입력하세요..."
            style={{ backgroundColor: "white" }}
            onKeyDown={handleKeyPress}
          />
          <Button
            variant="contained"
            style={{
              marginLeft: "0.5rem",
              backgroundColor: "#002B68",
              color: "white",
              minWidth: "70px",
              height: "60px",
            }}
            onClick={handleSendMessage}
            disabled={isLoading}
          >
            보내기
          </Button>
        </div>
      </div>
    </Container>
  );
};

export default ChatApp;

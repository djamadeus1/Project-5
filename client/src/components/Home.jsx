import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Home() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch("/check_session", {
          method: "GET",
          credentials: "include", // Ensures the session cookie is sent
        });
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else {
          navigate("/login"); // Redirect to login if session check fails
        }
      } catch (error) {
        console.error("Error checking session:", error);
        navigate("/login");
      }
    };

    checkSession();
  }, [navigate]);

  // New useEffect block for fetching contacts
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/contacts", {
          method: "GET",
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          console.log("Fetched contacts:", data); // Replace with setting state or rendering data
        } else {
          console.error("Failed to fetch contacts");
        }
      } catch (error) {
        console.error("Error fetching contacts:", error);
      }
    };

    fetchData();
  }, []); // Empty dependency array to fetch contacts once when the component mounts

  if (!user) {
    return <p>Loading...</p>; // Show a loading message while checking session
  }

  return (
    <div>
      <h1>Welcome, {user.username}!</h1>
      <p>This is your home page.</p>
    </div>
  );
}

export default Home;
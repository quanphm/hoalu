import axios from "redaxios";

export const httpClient = axios.create({
	baseURL: "http://localhost:3000/api",
	headers: {
		"Content-Type": "application/json",
	},
});

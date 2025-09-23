import google from "next-auth/providers/google"
import github from "next-auth/providers/github"
import { NextConfig } from "next"

export default{
  providers: [google({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  })
    , github({
        clientId: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
    })],
} satisfies NextConfig
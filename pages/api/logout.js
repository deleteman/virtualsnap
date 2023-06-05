
export default async function handler(req, res) {

    console.log("Logout api endoint called....")
    res.setHeader(
        "Set-Cookie", [
            `jwtToken=deleted; Max-Age=0; HttpOnly; SameSite=Lax; path=/ `,
        ]);

    res.status(200)
    res.json({
        success: true
    })
}
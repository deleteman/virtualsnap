import { CardBody ,CardHeader ,Card, SaasProvider, CardTitle, Persona  } from "@saas-ui/react"
import { LineChart, Sparklines } from "@saas-ui/charts"
import { Divider, SimpleGrid } from "@chakra-ui/react"
import { List } from "@saas-ui/react"
import { Tag } from "@chakra-ui/react"


export default function Dashboard({}) {

    const chartData = [
        {x:1, y:1, xv: "Mon", yv: 1},
        {x:2, y:10, xv: "Tue", yv: 10},
        {x:3, y:40, xv: "Wed", yv: 40},
        {x:4, y:20, xv: "Thu", yv: 20},
        {x:5, y:100, xv: "Fri", yv: 100},
    ]

    const mau = [
        {x:1, y:10, xv: "Jan", yv: "10"},
        {x:2, y:30, xv: "Feb", yv: "30"},
        {x:3, y:60, xv: "Mar", yv: "60"},
        {x:4, y:30, xv: "Jun", yv: "30"},
        {x:5, y:100, xv: "Jul", yv: "100"},
    ]

    const activeUsers = [
                        {
                            primary: 'Elliot Anderson',
                            secondary: 'Hacker',
                            tertiary: <Tag>neo</Tag>,
                        },
                        {
                            primary: 'Zack Muckerberg',
                            secondary: 'CEO',
                            tertiary: <Tag>meta</Tag>,
                        },
                        {
                            primary: 'Mr. Altman',
                            secondary: 'AI expert',
                            tertiary: <Tag>openai</Tag>,
                        }
                    ]

    return (
        <SaasProvider>
            <SimpleGrid columns={2} gap={4}>
                <Card >
                    <CardHeader>
                        <CardTitle>Most active user</CardTitle>
                    </CardHeader>
                    <CardBody>
                        <Persona name="Fernando Doglio" secondaryLabel="Premium user" presence="online" />
                    </CardBody>
                </Card>
                 <Card >
                    <CardHeader>
                        <CardTitle>Top 3 users</CardTitle>
                    </CardHeader>
                    <CardBody>
                        <List
                            items={activeUsers}
                            />
                    </CardBody>
                </Card>
                <Card >
                    <CardHeader>
                        <CardTitle>Daily user count</CardTitle>
                    </CardHeader>
                    <CardBody>
                        <LineChart data={chartData} variant="solid" limit={100} height={290}/>
                    </CardBody>
                </Card>
                <Card >
                    <CardHeader>
                        <CardTitle>Monthly Active Users</CardTitle>
                    </CardHeader>
                    <CardBody>
                        <LineChart data={mau} variant="gradient" limit={100} height={290}/>
                    </CardBody>
                </Card>
            </SimpleGrid>
        </SaasProvider>

        )
}
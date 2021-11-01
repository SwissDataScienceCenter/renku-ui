/* eslint-disable */
export const statuspage = {
  "page": {
    "id": "q1n7m8bwwlxt",
    "name": "illposed",
    "url": "https://illposed.statuspage.io",
    "time_zone": "Etc/UTC",
    "updated_at": "2021-10-28T11:39:27.351Z"
  },
  "components": [
    {
      "id": "5wl5x0fggfqv",
      "name": "API",
      "status": "operational",
      "created_at": "2020-07-17T11:09:11.216Z",
      "updated_at": "2021-10-23T11:00:35.159Z",
      "position": 1,
      "description": "The API",
      "showcase": true,
      "start_date": null,
      "group_id": null,
      "page_id": "q1n7m8bwwlxt",
      "group": false,
      "only_show_if_degraded": false
    },
    {
      "id": "y0j1kqyxj1w2",
      "name": "KG",
      "status": "operational",
      "created_at": "2020-07-21T15:47:58.417Z",
      "updated_at": "2021-10-18T11:47:00.903Z",
      "position": 1,
      "description": "The knowledge graph",
      "showcase": true,
      "start_date": null,
      "group_id": "jdmyb79xmqh7",
      "page_id": "q1n7m8bwwlxt",
      "group": false,
      "only_show_if_degraded": false
    },
    {
      "id": "7cl0q594rt3g",
      "name": "Core Service",
      "status": "operational",
      "created_at": "2020-07-17T11:09:11.228Z",
      "updated_at": "2020-08-21T08:30:29.523Z",
      "position": 2,
      "description": "Renku core service",
      "showcase": true,
      "start_date": null,
      "group_id": null,
      "page_id": "q1n7m8bwwlxt",
      "group": false,
      "only_show_if_degraded": false
    },
    {
      "id": "fhg73l8p4v11",
      "name": "Loud",
      "status": "operational",
      "created_at": "2021-10-25T14:12:09.886Z",
      "updated_at": "2021-10-28T10:07:38.887Z",
      "position": 3,
      "description": "Component to indicate if the status notification needs higher visibility.",
      "showcase": false,
      "start_date": "2021-10-25",
      "group_id": null,
      "page_id": "q1n7m8bwwlxt",
      "group": false,
      "only_show_if_degraded": false
    }
  ],
  "incidents": [

  ],
  "scheduled_maintenances": [
    {
      "id": "gtny7hgjy2qx",
      "name": "Please shut down any sessions",
      "status": "scheduled",
      "created_at": "2021-10-28T10:08:41.168Z",
      "updated_at": "2021-10-28T11:39:27.342Z",
      "monitoring_at": null,
      "resolved_at": null,
      "impact": "maintenance",
      "shortlink": "https://stspg.io/yzmzx4a0600v",
      "started_at": "2021-10-28T10:08:41.163Z",
      "page_id": "q1n7m8bwwlxt",
      "incident_updates": [
        {
          "id": "tx2twyftbxfs",
          "status": "scheduled",
          "body": "Shut down your sessions",
          "incident_id": "gtny7hgjy2qx",
          "created_at": "2021-10-28T11:39:27.340Z",
          "updated_at": "2021-10-28T11:39:27.340Z",
          "display_at": "2021-10-28T11:39:27.340Z",
          "affected_components": [
            {
              "code": "5wl5x0fggfqv",
              "name": "API",
              "old_status": "operational",
              "new_status": "operational"
            }
          ],
          "deliver_notifications": true,
          "custom_tweet": null,
          "tweet_id": null
        },
        {
          "id": "k1w8y0nt5vqf",
          "status": "scheduled",
          "body": "We will be undergoing scheduled maintenance during this time.",
          "incident_id": "gtny7hgjy2qx",
          "created_at": "2021-10-28T11:30:49.935Z",
          "updated_at": "2021-10-28T11:30:49.935Z",
          "display_at": "2021-10-28T11:30:49.935Z",
          "affected_components": [
            {
              "code": "5wl5x0fggfqv",
              "name": "API",
              "old_status": "operational",
              "new_status": "operational"
            }
          ],
          "deliver_notifications": false,
          "custom_tweet": null,
          "tweet_id": null
        },
        {
          "id": "gdsnb8wpb4w9",
          "status": "scheduled",
          "body": "We will be undergoing scheduled maintenance during this time.",
          "incident_id": "gtny7hgjy2qx",
          "created_at": "2021-10-28T10:08:41.216Z",
          "updated_at": "2021-10-28T10:08:41.216Z",
          "display_at": "2021-10-28T10:08:41.216Z",
          "affected_components": [
            {
              "code": "fhg73l8p4v11",
              "name": "Loud",
              "old_status": "operational",
              "new_status": "operational"
            }
          ],
          "deliver_notifications": true,
          "custom_tweet": null,
          "tweet_id": null
        }
      ],
      "components": [
        {
          "id": "5wl5x0fggfqv",
          "name": "API",
          "status": "operational",
          "created_at": "2020-07-17T11:09:11.216Z",
          "updated_at": "2021-10-23T11:00:35.159Z",
          "position": 1,
          "description": null,
          "showcase": true,
          "start_date": null,
          "group_id": null,
          "page_id": "q1n7m8bwwlxt",
          "group": false,
          "only_show_if_degraded": false
        }
      ],
      "scheduled_for": "2021-11-01T08:30:00.000Z",
      "scheduled_until": "2021-11-01T10:30:00.000Z"
    }
  ],
  "status": {
    "indicator": "none",
    "description": "All Systems Operational"
  }
}

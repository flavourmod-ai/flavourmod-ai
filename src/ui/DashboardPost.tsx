export const DashboardPost = (context: any) => {

  /* =========================================================
     KV STORE ACCESS
  ========================================================= */

  const kv =
    context.kvStore;

  /* =========================================================
     LOCAL REFRESH STATE
  ========================================================= */

  const [refresh, setRefresh] =
    context.useState(0);

  /* =========================================================
     AUTO REFRESH LOOP
     Forces dashboard polling every 1.5 sec
  ========================================================= */

  context.useEffect(() => {

    console.log(
      "⚡ DASHBOARD AUTO REFRESH STARTED"
    );

    const id =
      setInterval(() => {

        setRefresh(
          (r: number) => r + 1
        );

      }, 1500);

    return () => {

      console.log(
        "🛑 DASHBOARD AUTO REFRESH STOPPED"
      );

      clearInterval(id);
    };

  }, []);

  /* =========================================================
     VERSION FETCH
     Used for realtime sync tracking
  ========================================================= */

  const versionState =
    context.useAsync(async () => {

      try {

        console.log(
          "📡 FETCHING DASHBOARD VERSION"
        );

        const v =
          await kv.get(
            "dashboard:version"
          );

        return v
          ? String(v)
          : "0";

      } catch (err) {

        console.log(
          "❌ VERSION FETCH ERROR:",
          err
        );

        return "0";
      }

    }, [refresh]);

  const version =
    versionState?.data ?? "0";

  /* =========================================================
     QUEUE FETCH
     Pulls latest moderation dashboard data
  ========================================================= */

  const queueState =
    context.useAsync(async () => {

      try {

        console.log(
          "📦 FETCHING DASHBOARD QUEUE"
        );

        const raw =
          await kv.get(
            "dashboard:queue"
          );

        if (!raw) {

          console.log(
            "⚠️ EMPTY DASHBOARD QUEUE"
          );

          return [];
        }

        /* =========================
           STRING STORAGE
        ========================= */

        if (typeof raw === "string") {

          const parsed =
            JSON.parse(raw);

          console.log(
            "✅ QUEUE PARSED:",
            parsed?.length || 0
          );

          return Array.isArray(parsed)
            ? parsed
            : [];
        }

        /* =========================
           ARRAY STORAGE
        ========================= */

        if (Array.isArray(raw)) {

          console.log(
            "✅ ARRAY QUEUE DETECTED:",
            raw.length
          );

          return raw;
        }

        console.log(
          "⚠️ UNKNOWN QUEUE FORMAT"
        );

        return [];

      } catch (err) {

        console.log(
          "❌ QUEUE FETCH ERROR:",
          err
        );

        return [];
      }

    }, [refresh, version]);

  const queue =
    queueState?.data ?? [];

  /* =========================================================
     DASHBOARD DEBUG LOGS
  ========================================================= */

  console.log(
    "🔥 DASHBOARD RENDER SUCCESS"
  );

  console.log(
    "📊 DASHBOARD VERSION:",
    version
  );

  console.log(
    "📦 DASHBOARD QUEUE SIZE:",
    Array.isArray(queue)
      ? queue.length
      : 0
  );

  /* =========================================================
     SAFE UI RENDER
  ========================================================= */

  return (
    <blocks>

      <vstack
        padding="medium"
        gap="medium"
      >

        {/* =========================
           HEADER
        ========================= */}

        <text
          size="xlarge"
          weight="bold"
        >
          🔥 FlavourMod Live Dashboard
        </text>

        <text>
          Real-time AI moderation tracking
        </text>

        {/* =========================
           STATS
        ========================= */}

        <vstack
          padding="small"
          border="thin"
          gap="small"
        >

          <text weight="bold">
            📊 Dashboard Stats
          </text>

          <text>
            Queue Size: {
              Array.isArray(queue)
                ? queue.length
                : 0
            }
          </text>

          <text>
            Version Sync: {version}
          </text>

          <text>
            Refresh Tick: {refresh}
          </text>

        </vstack>

        {/* =========================
           EMPTY STATE
        ========================= */}

        {
          Array.isArray(queue) &&
          queue.length === 0 && (

            <vstack
              padding="small"
              border="thin"
            >

              <text weight="bold">
                ⚠️ No moderation jobs yet
              </text>

              <text>
                Submit a recipe post to begin AI moderation.
              </text>

            </vstack>
          )
        }

        {/* =========================
           QUEUE ITEMS
        ========================= */}

        {
          Array.isArray(queue) &&
          queue
            .slice(0, 10)
            .map((item: any, i: number) => (

              <vstack
                key={item?.postId || i}
                padding="small"
                border="thin"
                gap="small"
              >

                <text weight="bold">
                  📌 {
                    item?.postId ??
                    "unknown-post"
                  }
                </text>

                <text>
                  🤖 Decision: {
                    item?.decision ??
                    "QUEUED"
                  }
                </text>

                <text>
                  📊 Score: {
                    item?.score ?? 0
                  }/100
                </text>

                <text>
                  🎯 Confidence: {
                    item?.confidence ?? 0
                  }%
                </text>

                <text>
                  📝 Reason: {
                    item?.reason ??
                    "Pending AI analysis"
                  }
                </text>

                <text>
                  ⏱ Updated: {
                    item?.updatedAt
                      ? new Date(
                          item.updatedAt
                        ).toLocaleTimeString()
                      : "Waiting"
                  }
                </text>

              </vstack>
            ))
        }

        {/* =========================
           FOOTER
        ========================= */}

        <text>
          ⚡ FlavourMod AI • Live Moderation Engine
        </text>

      </vstack>

    </blocks>
  );
};
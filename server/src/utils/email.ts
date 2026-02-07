import os from "os";
import net from "net";
import tls from "tls";

export type EmailProvider = "log" | "smtp" | "resend";

export type EmailConfig = {
  provider: EmailProvider;
  to: string[];
  from: string;
  subjectPrefix: string;
  smtp?: {
    host: string;
    port: number;
    secure: boolean;
    user: string;
    pass: string;
  };
  resend?: {
    apiKey: string;
  };
};

const splitCsv = (value: string) =>
  value
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);

const parseBool = (value: string | undefined, fallback: boolean) => {
  const v = (value ?? "").trim().toLowerCase();
  if (v === "") return fallback;
  if (v === "true" || v === "1" || v === "yes") return true;
  if (v === "false" || v === "0" || v === "no") return false;
  return fallback;
};

export const shouldSendCustomerEmails = () =>
  parseBool(process.env.EMAIL_SEND_CUSTOMERS, true);

const getAdminEmailFallback = () =>
  (process.env.ADMIN_EMAIL || "").trim().toLowerCase();

export const getEmailConfig = (): EmailConfig => {
  const provider = ((process.env.EMAIL_PROVIDER as EmailProvider | undefined) ||
    "log") as EmailProvider;

  const primaryTo = splitCsv(process.env.EMAIL_TO || "");
  const to = primaryTo.length ? primaryTo : splitCsv(getAdminEmailFallback());

  const fromExplicit = (process.env.EMAIL_FROM || "").trim();
  const from =
    fromExplicit ||
    (provider === "smtp" ? (process.env.SMTP_USER || "").trim() : "") ||
    "";

  const subjectPrefix = (process.env.EMAIL_SUBJECT_PREFIX || "Portfolio")
    .trim()
    .replace(/\s+/g, " ");

  if (provider === "resend") {
    const apiKey = (process.env.RESEND_API_KEY || "").trim();
    return { provider, to, from, subjectPrefix, resend: { apiKey } };
  }

  if (provider !== "smtp") {
    return { provider, to, from, subjectPrefix };
  }

  const host = (process.env.SMTP_HOST || "").trim();
  const port = Number.parseInt(String(process.env.SMTP_PORT || "465"), 10);
  const secure = parseBool(process.env.SMTP_SECURE, port === 465);
  const user = (process.env.SMTP_USER || "").trim();
  const pass = (process.env.SMTP_PASS || "").trim();

  return {
    provider,
    to,
    from,
    subjectPrefix,
    smtp: {
      host,
      port: Number.isFinite(port) ? port : 465,
      secure,
      user,
      pass,
    },
  };
};

type SmtpResponse = { code: number; lines: string[] };

const parseSmtpLine = (line: string) => {
  const m = line.match(/^(\d{3})([ -])(.*)$/);
  if (!m) return null;
  const code = Number.parseInt(m[1], 10);
  const sep = m[2];
  const text = m[3] ?? "";
  return { code, sep, text };
};

const base64 = (value: string) => Buffer.from(value, "utf8").toString("base64");

const encodeHeaderValue = (value: string) => {
  // RFC 2047 encoded-word for non-ASCII header values (e.g., Subject)
  const hasNonAscii = /[^\x20-\x7E]/.test(value);
  if (!hasNonAscii) return value;
  return `=?UTF-8?B?${base64(value)}?=`;
};

const extractEmailAddress = (value: string) => {
  const trimmed = value.trim();
  const m = trimmed.match(/<([^>]+)>/);
  return (m ? m[1] : trimmed).trim();
};

const dotStuff = (data: string) => {
  return data
    .split(/\r?\n/)
    .map((line) => (line.startsWith(".") ? `.${line}` : line))
    .join("\r\n");
};

const buildMimeMessage = (payload: {
  from: string;
  to: string[];
  subject: string;
  text: string;
  html?: string;
}) => {
  const boundary = `mr_boundary_${Math.random().toString(16).slice(2)}`;
  const headers: string[] = [];
  headers.push(`From: ${payload.from}`);
  headers.push(`To: ${payload.to.join(", ")}`);
  headers.push(`Subject: ${encodeHeaderValue(payload.subject)}`);
  headers.push(`Date: ${new Date().toUTCString()}`);
  headers.push("MIME-Version: 1.0");
  headers.push(`Content-Type: multipart/alternative; boundary="${boundary}"`);

  const parts: string[] = [];
  parts.push(`--${boundary}`);
  parts.push('Content-Type: text/plain; charset="UTF-8"');
  parts.push("Content-Transfer-Encoding: 8bit");
  parts.push("");
  parts.push(payload.text);

  if (payload.html) {
    parts.push("");
    parts.push(`--${boundary}`);
    parts.push('Content-Type: text/html; charset="UTF-8"');
    parts.push("Content-Transfer-Encoding: 8bit");
    parts.push("");
    parts.push(payload.html);
  }

  parts.push("");
  parts.push(`--${boundary}--`);
  parts.push("");

  return `${headers.join("\r\n")}\r\n\r\n${parts.join("\r\n")}`;
};

type SmtpSocket = net.Socket | tls.TLSSocket;

const connectImplicitTls = async (cfg: { host: string; port: number }) => {
  return await new Promise<tls.TLSSocket>((resolve, reject) => {
    const s = tls.connect(
      {
        host: cfg.host,
        port: cfg.port,
        servername: cfg.host,
      },
      () => resolve(s),
    );
    s.once("error", reject);
  });
};

const connectPlain = async (cfg: { host: string; port: number }) => {
  return await new Promise<net.Socket>((resolve, reject) => {
    const s = net.connect(
      {
        host: cfg.host,
        port: cfg.port,
      },
      () => resolve(s),
    );
    s.once("error", reject);
  });
};

const upgradeToStartTls = async (socket: net.Socket, host: string) => {
  return await new Promise<tls.TLSSocket>((resolve, reject) => {
    const s = tls.connect(
      {
        socket,
        servername: host,
      },
      () => resolve(s),
    );
    s.once("error", reject);
  });
};

const resendSendMail = async (
  cfg: { apiKey: string; from: string; to: string[] },
  payload: { subject: string; text: string; html?: string },
) => {
  const resp = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${cfg.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: cfg.from,
      to: cfg.to,
      subject: payload.subject,
      text: payload.text,
      ...(payload.html ? { html: payload.html } : {}),
    }),
  });

  if (resp.ok) return;

  const body = await resp.text().catch(() => "");
  throw new Error(
    `Resend API error (${resp.status}): ${body || resp.statusText}`,
  );
};

const smtpSendMail = async (cfg: Required<EmailConfig>["smtp"] & { from: string; to: string[] }, payload: {
  subject: string;
  text: string;
  html?: string;
}) => {
  let socket: SmtpSocket = cfg.secure
    ? await connectImplicitTls(cfg)
    : await connectPlain(cfg);

  let buffer = "";
  const queue: string[] = [];

  const onChunk = (chunk: Buffer) => {
    buffer += chunk.toString("utf8");
    const parts = buffer.split("\r\n");
    buffer = parts.pop() ?? "";
    for (const line of parts) {
      if (line !== "") queue.push(line);
    }
  };

  const attach = (s: SmtpSocket) => s.on("data", onChunk);
  const detach = (s: SmtpSocket) => s.off("data", onChunk);

  attach(socket);

  const waitForMore = () =>
    new Promise<void>((resolve, reject) => {
      const onData = () => {
        cleanup();
        resolve();
      };
      const onError = (err: any) => {
        cleanup();
        reject(err);
      };
      const onClose = () => {
        cleanup();
        reject(new Error("SMTP connection closed"));
      };
      const cleanup = () => {
        socket.off("data", onData);
        socket.off("error", onError);
        socket.off("close", onClose);
      };
      socket.once("data", onData);
      socket.once("error", onError);
      socket.once("close", onClose);
    });

  const readResponse = async (): Promise<SmtpResponse> => {
    const lines: string[] = [];
    let code: number | null = null;

    // eslint-disable-next-line no-constant-condition
    while (true) {
      while (queue.length === 0) {
        await waitForMore();
      }

      const line = queue.shift() as string;
      lines.push(line);

      const parsed = parseSmtpLine(line);
      if (!parsed) continue;
      if (code === null) code = parsed.code;
      if (parsed.code === code && parsed.sep === " ") {
        return { code, lines };
      }
    }
  };

  const sendCmd = async (cmd: string): Promise<SmtpResponse> => {
    socket.write(cmd + "\r\n");
    return await readResponse();
  };

  const expect = (resp: SmtpResponse, okCodes: number[]) => {
    if (okCodes.includes(resp.code)) return;
    throw new Error(resp.lines.join("\n"));
  };

  try {
    expect(await readResponse(), [220]);

    const hostname = os.hostname() || "localhost";
    expect(await sendCmd(`EHLO ${hostname}`), [250]);

    if (!cfg.secure) {
      // STARTTLS (explicit TLS) — common on port 587.
      expect(await sendCmd("STARTTLS"), [220]);

      const plain = socket as net.Socket;
      detach(plain);
      socket = await upgradeToStartTls(plain, cfg.host);
      attach(socket);

      // RFC 3207: must re-issue EHLO after STARTTLS.
      expect(await sendCmd(`EHLO ${hostname}`), [250]);
    }

    expect(await sendCmd("AUTH LOGIN"), [334]);
    expect(await sendCmd(base64(cfg.user)), [334]);
    expect(await sendCmd(base64(cfg.pass)), [235]);

    const fromAddr = extractEmailAddress(cfg.from);
    expect(await sendCmd(`MAIL FROM:<${fromAddr}>`), [250]);

    for (const to of cfg.to) {
      const addr = extractEmailAddress(to);
      expect(await sendCmd(`RCPT TO:<${addr}>`), [250, 251]);
    }

    expect(await sendCmd("DATA"), [354]);

    const raw = buildMimeMessage({
      from: cfg.from,
      to: cfg.to,
      subject: payload.subject,
      text: payload.text,
      html: payload.html,
    });

    const stuffed = dotStuff(raw);
    socket.write(stuffed + "\r\n.\r\n");
    expect(await readResponse(), [250]);

    expect(await sendCmd("QUIT"), [221]);
  } finally {
    socket.end();
  }
};

export const sendAdminEmail = async (payload: {
  subject: string;
  text: string;
  html?: string;
}) => {
  const cfg = getEmailConfig();

  if (cfg.to.length === 0) {
    throw new Error("EMAIL_TO is required (comma-separated)");
  }

  await sendEmail({ to: cfg.to, ...payload });
};

export const safeSendAdminEmail = async (
  payload: { subject: string; text: string; html?: string },
  tag: string,
) => {
  try {
    await sendAdminEmail(payload);
  } catch (err) {
    console.log(`[Email] send failed (${tag}):`, err);
  }
};

export const sendEmail = async (payload: {
  to: string | string[];
  subject: string;
  text: string;
  html?: string;
}) => {
  const cfg = getEmailConfig();
  const to = (Array.isArray(payload.to) ? payload.to : [payload.to])
    .map((v) => v.trim())
    .filter(Boolean);

  if (to.length === 0) {
    throw new Error("Email recipient is required");
  }

  const subject = `${cfg.subjectPrefix}: ${payload.subject}`.trim();

  if (cfg.provider === "log") {
    console.log("[Email:log] to=" + to.join(", "));
    console.log("[Email:log] subject=" + subject);
    console.log(payload.text);
    return;
  }

  if (cfg.provider === "resend") {
    const apiKey = cfg.resend?.apiKey || "";
    if (!apiKey) throw new Error("RESEND_API_KEY is required.");
    if (!cfg.from) throw new Error("EMAIL_FROM is required.");
    await resendSendMail(
      { apiKey, from: cfg.from, to },
      { subject, text: payload.text, html: payload.html },
    );
    return;
  }

  const smtp = cfg.smtp;
  if (!smtp) throw new Error("SMTP config missing");
  if (!smtp.host || !smtp.user || !smtp.pass) {
    throw new Error("SMTP is not configured (missing SMTP_HOST/USER/PASS).");
  }

  const from = cfg.from || smtp.user;
  if (!from) throw new Error("EMAIL_FROM (or SMTP_USER) is required.");

  await smtpSendMail(
    { ...smtp, from, to },
    { subject, text: payload.text, html: payload.html },
  );
};

export const safeSendEmail = async (
  payload: { to: string | string[]; subject: string; text: string; html?: string },
  tag: string,
) => {
  try {
    await sendEmail(payload);
  } catch (err) {
    console.log(`[Email] send failed (${tag}):`, err);
  }
};

package com.zexa.aioffline.ui

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import android.widget.Toast
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.zexa.aioffline.R
import com.zexa.aioffline.data.ChatMessage
import io.noties.markwon.Markwon

class ChatAdapter : ListAdapter<ChatMessage, ChatAdapter.ChatViewHolder>(MessageDiffCallback()) {

    init {
        setHasStableIds(true)
    }

    override fun getItemId(position: Int): Long = getItem(position).id.hashCode().toLong()

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ChatViewHolder {
        val view = LayoutInflater.from(parent.context).inflate(R.layout.item_message, parent, false)
        return ChatViewHolder(view)
    }

    override fun onBindViewHolder(holder: ChatViewHolder, position: Int) {
        holder.bind(getItem(position))
    }

    override fun onBindViewHolder(holder: ChatViewHolder, position: Int, payloads: MutableList<Any>) {
        if (payloads.isNotEmpty() && payloads.contains("text_update")) {
            holder.updateTextOnly(getItem(position))
        } else {
            super.onBindViewHolder(holder, position, payloads)
        }
    }

    class ChatViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        private val tvUserMessage = view.findViewById<TextView>(R.id.tvUserMessage)
        private val layoutAI = view.findViewById<View>(R.id.layoutAI)
        private val tvAIMessage = view.findViewById<TextView>(R.id.tvAIMessage)
        private val btnCopyAI = view.findViewById<View>(R.id.btnCopyAI)
        private val tvMetrics = view.findViewById<TextView>(R.id.tvMetrics)
        private val layoutThinking = view.findViewById<View>(R.id.layoutThinking)
        private val tvThinking = view.findViewById<TextView>(R.id.tvThinking)
        
        private val markwon = Markwon.create(view.context)
        private var lastRenderedText: String = ""

        init {
            if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.M) {
                tvAIMessage.breakStrategy = android.text.Layout.BREAK_STRATEGY_SIMPLE
                tvAIMessage.hyphenationFrequency = android.text.Layout.HYPHENATION_FREQUENCY_NONE
            }
            
            // ✅ ENABLE SELECTION PROGRAMMATICALLY
            tvAIMessage.setTextIsSelectable(true)
            tvUserMessage.setTextIsSelectable(true)

            // ✅ Fallback: Long-click to copy the entire message quickly
            val longClickListener = View.OnLongClickListener { v ->
                val textView = v as? TextView ?: return@OnLongClickListener false
                val textToCopy = textView.text.toString()
                if (textToCopy.isNotEmpty()) {
                    val clipboard = v.context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
                    val clip = ClipData.newPlainText("Zexa AI", textToCopy)
                    clipboard.setPrimaryClip(clip)
                    Toast.makeText(v.context, "Message copied to clipboard", Toast.LENGTH_SHORT).show()
                    true
                } else false
            }

            tvAIMessage.setOnLongClickListener(longClickListener)
            tvUserMessage.setOnLongClickListener(longClickListener)

            // ✅ BUTTON CLICK TO COPY (EASY FOR STUDENTS)
            btnCopyAI?.setOnClickListener {
                val text = tvAIMessage.text.toString()
                if (text.isNotEmpty()) {
                    val clipboard = it.context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
                    val clip = ClipData.newPlainText("Zexa AI", text)
                    clipboard.setPrimaryClip(clip)
                    Toast.makeText(it.context, "Answer copied!", Toast.LENGTH_SHORT).show()
                }
            }
        }

        fun updateTextOnly(message: ChatMessage) {
            if (!message.isUser) {
                if (message.text.startsWith("ZEXA IS ")) {
                    tvThinking.text = message.text
                } else {
                    renderAIResponse(message.text)
                }
            }
        }

        private fun renderAIResponse(text: String) {
            if (text == lastRenderedText) return
            markwon.setMarkdown(tvAIMessage, text)
            lastRenderedText = text
        }

        fun bind(message: ChatMessage) {
            if (message.isUser) {
                tvUserMessage.visibility = View.VISIBLE
                layoutAI.visibility = View.GONE
                layoutThinking.visibility = View.GONE
                tvUserMessage.text = message.text
            } else {
                tvUserMessage.visibility = View.GONE
                if (message.text.isEmpty() || message.text.startsWith("ZEXA IS ")) {
                    layoutAI.visibility = View.GONE
                    layoutThinking.visibility = View.VISIBLE
                    tvThinking.text = if (message.text.isEmpty()) "ZEXA IS THINKING..." else message.text
                } else {
                    layoutAI.visibility = View.VISIBLE
                    layoutThinking.visibility = View.GONE
                    btnCopyAI?.visibility = View.VISIBLE
                    markwon.setMarkdown(tvAIMessage, message.text)
                    lastRenderedText = message.text
                    // 🎯 USER FIX: Permanently hiding metrics/disclaimer text under answers
                    tvMetrics.visibility = View.GONE
                }
            }
        }
    }

    class MessageDiffCallback : DiffUtil.ItemCallback<ChatMessage>() {
        override fun areItemsTheSame(oldItem: ChatMessage, newItem: ChatMessage) = oldItem.id == newItem.id
        override fun areContentsTheSame(oldItem: ChatMessage, newItem: ChatMessage) = 
            oldItem.text == newItem.text && oldItem.metrics == newItem.metrics

        override fun getChangePayload(oldItem: ChatMessage, newItem: ChatMessage): Any? {
            if (oldItem.id != newItem.id) return null
            val wasThinking = oldItem.text.isEmpty() || oldItem.text.startsWith("ZEXA IS ")
            val isThinking = newItem.text.isEmpty() || newItem.text.startsWith("ZEXA IS ")
            if (wasThinking != isThinking) return null
            return if (oldItem.text != newItem.text) "text_update" else null
        }
    }
}

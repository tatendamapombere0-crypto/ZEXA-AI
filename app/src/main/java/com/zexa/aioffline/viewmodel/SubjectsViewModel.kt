package com.zexa.aioffline.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.zexa.aioffline.data.KnowledgeChunk
import com.zexa.aioffline.data.LocalKnowledgeStore
import com.zexa.aioffline.data.PreferenceManager
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.launch

class SubjectsViewModel(application: Application) : AndroidViewModel(application) {

    private val preferenceManager = PreferenceManager(application)
    
    private val _subjects = MutableStateFlow<List<String>>(emptyList())
    val subjects: StateFlow<List<String>> = _subjects

    private val _topics = MutableStateFlow<List<KnowledgeChunk>>(emptyList())
    val topics: StateFlow<List<KnowledgeChunk>> = _topics

    init {
        viewModelScope.launch {
            preferenceManager.educationLevel.collectLatest { level ->
                if (level != null) {
                    _subjects.value = LocalKnowledgeStore.getSubjects(level, getApplication())
                }
            }
        }
    }

    fun loadTopics(subject: String) {
        viewModelScope.launch {
            preferenceManager.educationLevel.collectLatest { level ->
                if (level != null) {
                    _topics.value = LocalKnowledgeStore.getTopics(level, subject, getApplication())
                }
            }
        }
    }
}
